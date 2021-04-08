import React, { useEffect, useRef, useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { loadModules } from "esri-loader";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import LoadingOverlay from "react-loading-overlay";

import "./simulasi.css";
import { Header, Menu } from "../../components";
import { config } from "../../Constants";

import styled, { css } from "styled-components";

const DarkBackground = styled.div`
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 999; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */

  ${(props) =>
    props.disappear &&
    css`
      display: block; /* show */
    `}
`;

const SimulasiMap = () => {
  let history = useHistory();
  // Form State
  const [form, setForm] = useState({
    namaproyek: null,
    provence: null,
    kota: null,
    data: null,
    simulation: [],
  });

  // Map State
  const mapRef = useRef();
  const [mapLoaded, setMapLoaded] = useState(true);
  const [modules, setModules] = useState(null);
  const [selectBuildings, setSelectBuildings] = useState(true);
  const [runAnalysis, setRunAnalysis] = useState(false);
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  const [stateView, setStateView] = useState(null);
  const [resultAnalysis, setResultAnalysis] = useState(false);
  const [resPersilTanah, setResPersilTanah] = useState({});
  const [loaded, setLoaded] = useState(true);

  // Form related functions
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    setForm(data);
  };

  const provinceData = [
    {
      name: "DKI Jakarta",
      city: ["Jakarta Utara", "Jakarta Barat", "Jakarta Pusat", "Jakarta Timur", "Jakarta Selatan"],
    },
    {
      name: "Banten",
      city: ["Kota Tangerang", "Kabupaten Tangerang", "Kota Tangerang Selatan"],
    },
    {
      name: "Jawa barat",
      city: ["Kota Depok", "Kota Bogor", "Kabupaten Bogor", "Kota Bandung"],
    },
  ];

  const [{ province, city }, setData] = useState({
    province: "DKI Jakarta",
    city: "",
  });

  const provinces = provinceData.map((province) => (
    <option key={province.name} value={province.name}>
      {province.name}
    </option>
  ));

  const cities = provinceData
    .find((item) => item.name === province)
    ?.city.map((cities) => (
      <option key={cities} value={cities}>
        {cities}
      </option>
    ));

  function handleProvinceChange(event) {
    setData((data) => ({ city: "", province: event.target.value }));
  }

  function handleCityChange(event) {
    setData((data) => ({ ...data, city: event.target.value }));
  }
  // end form related functions

  useEffect(() => {
    let isMounted = true;
    if (mapLoaded) {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      let lModules = loadModules(
        [
          "esri/Map",
          "esri/views/SceneView",
          "esri/layers/FeatureLayer",
          "esri/widgets/Legend",
          "esri/core/watchUtils",
          "esri/widgets/Expand",
          "esri/Graphic",
          "esri/tasks/support/Query",
          "esri/widgets/Editor",
          "esri/widgets/LayerList",
          "esri/widgets/Daylight",
          "esri/layers/VectorTileLayer",
          "esri/layers/MapImageLayer",
        ],
        {
          css: true,
          version: "4.18",
        }
      ).then(
        ([Map, SceneView, FeatureLayer, Legend, watchUtils, Expand, Graphic, Query, Editor, LayerList, Daylight, VectorTileLayer, MapImageLayer]) => {
          const map = new Map({
            basemap: "topo-vector",
            ground: "world-elevation",
          });

          const view = new SceneView({
            container: mapRef.current,
            map: map,
            camera: {
              position: [106.794803, -6.590398, 682.98652],
              heading: 0,
              tilt: 48.52,
            },
            environment: {
              lighting: {
                directShadowsEnabled: false,
                ambientOcclusionEnabled: true,
              },
            },
            highlightOptions: {
              color: [0, 255, 255],
              fillOpacity: 0.6,
            },
            popup: {
              dockEnabled: true,
              dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
              },
            },
          });

          function getSymbol(color) {
            return {
              type: "polygon-3d", // autocasts as new PolygonSymbol3D()
              symbolLayers: [
                {
                  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
                  material: {
                    color: color,
                  },
                  edges: {
                    type: "solid",
                    color: "#999",
                    size: 0.5,
                  },
                },
              ],
            };
          }
          const renderer = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbol("#B2B2B2"),
            defaultLabel: "Eksisting",
            field: "status_kdbklb",
            uniqueValueInfos: [
              {
                value: "Diizinkan",
                symbol: getSymbol("#38A800"),
                label: "Diizinkan",
              },
              {
                value: "Ditolak/rekomendasi",
                symbol: getSymbol("#E64C00"),
                label: "Ditolak/rekomendasi",
              },
            ],
            visualVariables: [
              {
                type: "size",
                field: "jlh_lantai",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const buildingsLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/KDBKLB/KDBKLB_Bangunan/FeatureServer/0",
            renderer: renderer,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Bangunan",
            popupTemplate: {
              title: "{status_kdbklb}",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "jenis",
                      label: "jenis",
                    },
                    {
                      fieldName: "jenis_bang",
                      label: "jenis_bang",
                    },
                    {
                      fieldName: "toponim",
                      label: "toponim",
                    },
                    {
                      fieldName: "sumber",
                      label: "sumber",
                    },
                    {
                      fieldName: "jlh_lantai",
                      label: "jlh_lantai",
                    },
                    {
                      fieldName: "melampaui_fa",
                      label: "melampaui_fa",
                    },
                    {
                      fieldName: "melampaui_tinggi",
                      label: "melampaui_tinggi",
                    },
                    {
                      fieldName: "status_kdbklb",
                      label: "Status",
                    },
                    {
                      fieldName: "id_bangunan",
                      label: "id_bangunan",
                    },
                    {
                      fieldName: "luas_m2",
                      label: "luas_m2",
                    },
                  ],
                },
              ],
            },
            outFields: ["status_kdbklb", "jlh_lantai"],
          });

          function getSymbolAirBersih(color) {
            return {
              type: "polygon-3d", // autocasts as new PolygonSymbol3D()
              symbolLayers: [
                {
                  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
                  material: {
                    color: color,
                  },
                  edges: {
                    type: "solid",
                    color: "#999",
                    size: 0.5,
                  },
                },
              ],
            };
          }
          const rendererAirBersih = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbolAirBersih("#B2B2B2"),
            defaultLabel: "Eksisting",
            field: "izin_air_y5",
            uniqueValueInfos: [
              {
                value: "Diizinkan",
                symbol: getSymbolAirBersih("#00A884"),
                label: "Diizinkan",
              },
              {
                value: "Ditolak/rekomendasi",
                symbol: getSymbolAirBersih("#730000"),
                label: "Ditolak/rekomendasi",
              },
            ],
            visualVariables: [
              {
                type: "size",
                field: "jlh_lantai",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const buildingsAirBersihLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Air/airbersih_bangunan/FeatureServer/0",
            renderer: rendererAirBersih,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Air Bersih",
            popupTemplate: {
              title: "Air Bersih",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "jenis",
                      label: "jenis",
                    },
                    {
                      fieldName: "jenis_bang",
                      label: "jenis_bang",
                    },
                    {
                      fieldName: "toponim",
                      label: "toponim",
                    },
                    {
                      fieldName: "sumber",
                      label: "sumber",
                    },
                    {
                      fieldName: "jlh_lantai",
                      label: "jlh_lantai",
                    },
                    {
                      fieldName: "melampaui_fa",
                      label: "melampaui_fa",
                    },
                    {
                      fieldName: "melampaui_tinggi",
                      label: "melampaui_tinggi",
                    },
                    {
                      fieldName: "id_bangunan",
                      label: "id_bangunan",
                    },
                    {
                      fieldName: "luas_m2",
                      label: "luas_m2",
                    },
                    {
                      fieldName: "pdam_kapasitas_harian",
                      label: "pdam_kapasitas_harian",
                    },
                    {
                      fieldName: "keb_air_harian_y5",
                      label: "keb_air_harian_y5",
                    },
                    {
                      fieldName: "keb_air_harian_y6",
                      label: "keb_air_harian_y6",
                    },
                    {
                      fieldName: "keb_air_harian_y7",
                      label: "keb_air_harian_y7",
                    },
                    {
                      fieldName: "keb_air_harian_y8",
                      label: "keb_air_harian_y8",
                    },
                    {
                      fieldName: "keb_air_harian_y9",
                      label: "keb_air_harian_y9",
                    },
                    {
                      fieldName: "keb_air_harian_y10",
                      label: "keb_air_harian_y10",
                    },
                    {
                      fieldName: "izin_air_y5",
                      label: "izin_air_y5",
                    },
                    {
                      fieldName: "izin_air_y6",
                      label: "izin_air_y6",
                    },
                    {
                      fieldName: "izin_air_y7",
                      label: "izin_air_y7",
                    },
                    {
                      fieldName: "izin_air_y8",
                      label: "izin_air_y8",
                    },
                    {
                      fieldName: "izin_air_y9",
                      label: "izin_air_y9",
                    },
                    {
                      fieldName: "izin_air_y10",
                      label: "izin_air_y10",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          function getSymbolKemacetan(color) {
            return {
              type: "polygon-3d", // autocasts as new PolygonSymbol3D()
              symbolLayers: [
                {
                  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
                  material: {
                    color: color,
                  },
                  edges: {
                    type: "solid",
                    color: "#999",
                    size: 0.5,
                  },
                },
              ],
            };
          }
          const rendererKemacetan = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbolKemacetan("#B2B2B2"),
            defaultLabel: "Eksisting",
            field: "izin_macet",
            uniqueValueInfos: [
              {
                value: "Diizinkan",
                symbol: getSymbolKemacetan("#00A884"),
                label: "Diizinkan",
              },
              {
                value: "Ditolak/rekomendasi",
                symbol: getSymbolKemacetan("#A80000"),
                label: "Ditolak/rekomendasi",
              },
            ],
            visualVariables: [
              {
                type: "size",
                field: "jlh_lantai",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const buildingsKemacetanLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Kemacetan/kemacetan_bangunan/FeatureServer/0",
            renderer: rendererKemacetan,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Kemacetan",
            popupTemplate: {
              title: "Kemacetan",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "jenis",
                      label: "jenis",
                    },
                    {
                      fieldName: "jenis_bang",
                      label: "jenis_bang",
                    },
                    {
                      fieldName: "toponim",
                      label: "toponim",
                    },
                    {
                      fieldName: "sumber",
                      label: "sumber",
                    },
                    {
                      fieldName: "jlh_lantai",
                      label: "jlh_lantai",
                    },
                    {
                      fieldName: "melampaui_fa",
                      label: "melampaui_fa",
                    },
                    {
                      fieldName: "melampaui_tinggi",
                      label: "melampaui_tinggi",
                    },
                    {
                      fieldName: "id_bangunan",
                      label: "id_bangunan",
                    },
                    {
                      fieldName: "luas_m2",
                      label: "luas_m2",
                    },
                    {
                      fieldName: "lebar_jalan",
                      label: "lebar_jalan",
                    },
                    {
                      fieldName: "panjang_jalan",
                      label: "panjang_jalan",
                    },
                    {
                      fieldName: "bangkitan",
                      label: "bangkitan",
                    },
                    {
                      fieldName: "bangkitan_ruasjalan",
                      label: "bangkitan_ruasjalan",
                    },
                    {
                      fieldName: "kapasitas",
                      label: "kapasitas",
                    },
                    {
                      fieldName: "los_num",
                      label: "los_num",
                    },
                    {
                      fieldName: "los",
                      label: "los",
                    },
                    {
                      fieldName: "izin_macet",
                      label: "izin_macet",
                    },
                    {
                      fieldName: "bangkitan_ruasjalan_y6",
                      label: "bangkitan_ruasjalan_y6",
                    },
                    {
                      fieldName: "bangkitan_ruasjalan_y7",
                      label: "bangkitan_ruasjalan_y7",
                    },
                    {
                      fieldName: "bangkitan_ruasjalan_y8",
                      label: "bangkitan_ruasjalan_y8",
                    },
                    {
                      fieldName: "bangkitan_ruasjalan_y9",
                      label: "bangkitan_ruasjalan_y9",
                    },
                    {
                      fieldName: "bangkitan_ruasjalan_y10",
                      label: "bangkitan_ruasjalan_y10",
                    },
                    {
                      fieldName: "izin_macet_y6",
                      label: "izin_macet_y6",
                    },
                    {
                      fieldName: "izin_macet_y7",
                      label: "izin_macet_y7",
                    },
                    {
                      fieldName: "izin_macet_y8",
                      label: "izin_macet_y8",
                    },
                    {
                      fieldName: "izin_macet_y9",
                      label: "izin_macet_y9",
                    },
                    {
                      fieldName: "izin_macet_y10",
                      label: "izin_macet_y10",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          function getSymbolSampah(color) {
            return {
              type: "polygon-3d", // autocasts as new PolygonSymbol3D()
              symbolLayers: [
                {
                  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
                  material: {
                    color: color,
                  },
                  edges: {
                    type: "solid",
                    color: "#999",
                    size: 0.5,
                  },
                },
              ],
            };
          }
          const rendererPersampahan = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbolSampah("#B2B2B2"),
            defaultLabel: "Eksisting",
            field: "izin_sampah_y5",
            uniqueValueInfos: [
              {
                value: "Diizinkan",
                symbol: getSymbolSampah("#A8A800"),
                label: "Diizinkan",
              },
              {
                value: "Ditolak/rekomendasi",
                symbol: getSymbolSampah("#730000"),
                label: "Ditolak/rekomendasi",
              },
            ],
            visualVariables: [
              {
                type: "size",
                field: "jlh_lantai",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const buildingPersampahanLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Persampahan/persampahan_Bangunan_Pabaton/FeatureServer/0",
            renderer: rendererPersampahan,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Persampahan",
            popupTemplate: {
              title: "Persampahan",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "jenis",
                      label: "jenis",
                    },
                    {
                      fieldName: "jenis_bang",
                      label: "jenis_bang",
                    },
                    {
                      fieldName: "toponim",
                      label: "toponim",
                    },
                    {
                      fieldName: "sumber",
                      label: "sumber",
                    },
                    {
                      fieldName: "jlh_lantai",
                      label: "jlh_lantai",
                    },
                    {
                      fieldName: "melampaui_fa",
                      label: "melampaui_fa",
                    },
                    {
                      fieldName: "melampaui_tinggi",
                      label: "melampaui_tinggi",
                    },
                    {
                      fieldName: "id_bangunan",
                      label: "id_bangunan",
                    },
                    {
                      fieldName: "luas_m2",
                      label: "luas_m2",
                    },
                    {
                      fieldName: "tps_kapasitas",
                      label: "tps_kapasitas",
                    },
                    {
                      fieldName: "bangkitan_sampah_y5",
                      label: "bangkitan_sampah_y5",
                    },
                    {
                      fieldName: "bangkitan_sampah_y6",
                      label: "bangkitan_sampah_y6",
                    },
                    {
                      fieldName: "bangkitan_sampah_y7",
                      label: "bangkitan_sampah_y7",
                    },
                    {
                      fieldName: "bangkitan_sampah_y8",
                      label: "bangkitan_sampah_y8",
                    },
                    {
                      fieldName: "bangkitan_sampah_y9",
                      label: "bangkitan_sampah_y9",
                    },
                    {
                      fieldName: "bangkitan_sampah_y10",
                      label: "bangkitan_sampah_y10",
                    },
                    {
                      fieldName: "izin_sampah_y5",
                      label: "izin_sampah_y5",
                    },
                    {
                      fieldName: "izin_sampah_y6",
                      label: "izin_sampah_y6",
                    },
                    {
                      fieldName: "izin_sampah_y7",
                      label: "izin_sampah_y7",
                    },
                    {
                      fieldName: "izin_sampah_y8",
                      label: "izin_sampah_y8",
                    },
                    {
                      fieldName: "izin_sampah_y9",
                      label: "izin_sampah_y9",
                    },
                    {
                      fieldName: "izin_sampah_y10",
                      label: "izin_sampah_y10",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          const sampahTpsLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Persampahan/Sampah_TPS/FeatureServer/0",
            title: "TPS",
            popupTemplate: {
              title: "TPS",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "namobj",
                      label: "namobj",
                    },
                    {
                      fieldName: "orde01",
                      label: "orde01",
                    },
                    {
                      fieldName: "orde02",
                      label: "orde02",
                    },
                    {
                      fieldName: "jnsrsr",
                      label: "jnsrsr",
                    },
                    {
                      fieldName: "stsjrn",
                      label: "stsjrn",
                    },
                    {
                      fieldName: "sbdata",
                      label: "sbdata",
                    },
                    {
                      fieldName: "kapasitas",
                      label: "kapasitas",
                    },
                    {
                      fieldName: "wadmkc",
                      label: "wadmkc",
                    },
                    {
                      fieldName: "wadmkd",
                      label: "wadmkd",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          const persilTanahLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/KDBKLB/KDBKLB_PersilTanah_Pabaton/MapServer/0",
            title: "Persil Tanah",
            popupTemplate: {
              title: "Persil Tanah",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "namobj",
                      label: "namobj",
                    },
                    {
                      fieldName: "namzon",
                      label: "namzon",
                    },
                    {
                      fieldName: "kodzon",
                      label: "kodzon",
                    },
                    {
                      fieldName: "namszn",
                      label: "namszn",
                    },
                    {
                      fieldName: "kodszn",
                      label: "kodszn",
                    },
                    {
                      fieldName: "nambwp",
                      label: "nambwp",
                    },
                    {
                      fieldName: "nasbwp",
                      label: "nasbwp",
                    },
                    {
                      fieldName: "kodblk",
                      label: "kodblk",
                    },
                    {
                      fieldName: "kodsbl",
                      label: "kodsbl",
                    },
                    {
                      fieldName: "wadmkc",
                      label: "wadmkc",
                    },
                    {
                      fieldName: "wadmkd",
                      label: "wadmkd",
                    },
                    {
                      fieldName: "luasha",
                      label: "luasha",
                    },
                    {
                      fieldName: "kdb",
                      label: "kdb",
                    },
                    {
                      fieldName: "klb",
                      label: "klb",
                    },
                    {
                      fieldName: "kdh",
                      label: "kdh",
                    },
                    {
                      fieldName: "lantai_max",
                      label: "lantai_max",
                    },
                    {
                      fieldName: "nib",
                      label: "nib",
                    },
                    {
                      fieldName: "status_pemb_optimum",
                      label: "status_pemb_optimum",
                    },
                    {
                      fieldName: "izin_air",
                      label: "izin_air",
                    },
                    {
                      fieldName: "izin_macet",
                      label: "izin_macet",
                    },
                    {
                      fieldName: "izin_sampah",
                      label: "izin_sampah",
                    },
                    {
                      fieldName: "izin_banjir",
                      label: "izin_banjir",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          const polaRuangLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/KDBKLB/KDBKLB_PolaRuang/MapServer/0",
            title: "Pola Ruang",
            popupTemplate: {
              title: "Pola Ruang",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "namobj",
                      label: "namobj",
                    },
                    {
                      fieldName: "namzon",
                      label: "namzon",
                    },
                    {
                      fieldName: "kodzon",
                      label: "kodzon",
                    },
                    {
                      fieldName: "namszn",
                      label: "namszn",
                    },
                    {
                      fieldName: "kodszn",
                      label: "kodszn",
                    },
                    {
                      fieldName: "nambwp",
                      label: "nambwp",
                    },
                    {
                      fieldName: "nasbwp",
                      label: "nasbwp",
                    },
                    {
                      fieldName: "kodblk",
                      label: "kodblk",
                    },
                    {
                      fieldName: "kodsbl",
                      label: "kodsbl",
                    },
                    {
                      fieldName: "wadmkc",
                      label: "wadmkc",
                    },
                    {
                      fieldName: "wadmkd",
                      label: "wadmkd",
                    },
                    {
                      fieldName: "kkop_1",
                      label: "kkop_1",
                    },
                    {
                      fieldName: "lp2b_2",
                      label: "lp2b_2",
                    },
                    {
                      fieldName: "krb_03",
                      label: "krb_03",
                    },
                    {
                      fieldName: "tod_04",
                      label: "tod_04",
                    },
                    {
                      fieldName: "teb_05",
                      label: "teb_05",
                    },
                    {
                      fieldName: "cagbud",
                      label: "cagbud",
                    },
                    {
                      fieldName: "hankam",
                      label: "hankam",
                    },
                    {
                      fieldName: "puslit",
                      label: "puslit",
                    },
                    {
                      fieldName: "tpz_00",
                      label: "tpz_00",
                    },
                    {
                      fieldName: "luasha",
                      label: "luasha",
                    },
                    {
                      fieldName: "kdb",
                      label: "kdb",
                    },
                    {
                      fieldName: "klb",
                      label: "klb",
                    },
                    {
                      fieldName: "kdh",
                      label: "kdh",
                    },
                    {
                      fieldName: "lantai_max",
                      label: "lantai_max",
                    },
                    {
                      fieldName: "status_pemb_optimum",
                      label: "status_pemb_optimum",
                    },
                    {
                      fieldName: "izin_air",
                      label: "izin_air",
                    },
                    {
                      fieldName: "izin_macet",
                      label: "izin_macet",
                    },
                    {
                      fieldName: "izin_sampah",
                      label: "izin_sampah",
                    },
                    {
                      fieldName: "izin_banjir",
                      label: "izin_banjir",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          const kemacetanJaringanJalanLayer = new MapImageLayer({
            url: config.url.ARCGIS_URL + "/Kemacetan/kemacetan_jaringan_jalan/MapServer",
            title: "Kemacetan Jaringan Jalan",
          });

          const basemapPolaRuangLayer = new VectorTileLayer({
            url: config.url.ARCGIS_URL + "/Hosted/KDBKLB_PolaRuang_base/VectorTileServer",
            title: "Basemap Pola Ruang",
          });

          const airBersihPdamLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Air/airbersih_pdam/FeatureServer/0",
            title: "Air Bersih PDAM",
            popupTemplate: {
              title: "Air Bersih PDAM",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "wadmkc",
                      label: "wadmkc",
                    },
                    {
                      fieldName: "wadmkd",
                      label: "wadmkd",
                    },
                    {
                      fieldName: "wpdam_id",
                      label: "wpdam_id",
                    },
                    {
                      fieldName: "wpdam_nama",
                      label: "wpdam_nama",
                    },
                    {
                      fieldName: "wpdam_kapasitas_harian",
                      label: "wpdam_kapasitas_harian",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
            editingEnabled: false,
          });

          map.addMany([
            basemapPolaRuangLayer,
            airBersihPdamLayer,
            kemacetanJaringanJalanLayer,
            polaRuangLayer,
            persilTanahLayer,
            sampahTpsLayer,
            buildingPersampahanLayer,
            buildingsKemacetanLayer,
            buildingsAirBersihLayer,
            buildingsLayer,
          ]);

          basemapPolaRuangLayer.visible = false;
          airBersihPdamLayer.visible = false;
          kemacetanJaringanJalanLayer.visible = false;
          sampahTpsLayer.visible = false;
          buildingPersampahanLayer.visible = false;
          buildingsKemacetanLayer.visible = false;
          buildingsAirBersihLayer.visible = false;

          async function finishLayer() {
            if (isMounted) {
              setMapLoaded(false);
            }
          }

          var highlight = null;
          view
            .whenLayerView(buildingsLayer)
            .then((layerView) => {
              return watchUtils.whenFalseOnce(layerView, "updating");
            })
            .then(() => {
              finishLayer();
            });

          view.when(function () {
            // start layerlist
            const layerList = new LayerList({
              container: document.createElement("div"),
              view: view,
              // listItemCreatedFunction: function (event) {
              //   var item = event.item;
              // },
            });
            const layerListExpand = new Expand({
              expandIconClass: "esri-icon-layers",
              expandTooltip: "Layer List",
              view: view,
              content: layerList.domNode,
            });
            view.ui.add({
              component: layerListExpand,
              position: "top-left",
            });
            // end layerlist

            // start editor
            var editor = new Editor({
              view: view,
            });
            const editorExpand = new Expand({
              expandIconClass: "esri-icon-edit",
              expandTooltip: "Editor",
              view: view,
              content: editor,
              // content: document.getElementById("placemarkExpDiv"),
            });

            view.ui.add({
              component: editorExpand,
              position: "top-left",
            });
            // end editor

            // start marking building
            const buildingsExp = new Expand({
              expandIconClass: "esri-icon-map-pin",
              expandTooltip: "Select Buildings",
              content: document.getElementById("buildingsExpDiv"),
              view: view,
            });
            view.ui.add({
              component: buildingsExp,
              position: "top-left",
            });
            const handleMarking = () => {
              view.container.classList.add("screenshotCursor");
              kemacetanJaringanJalanLayer.popupEnabled = false;
              airBersihPdamLayer.popupEnabled = false;
              polaRuangLayer.popupEnabled = false;
              persilTanahLayer.popupEnabled = false;
              sampahTpsLayer.popupEnabled = false;
              buildingPersampahanLayer.popupEnabled = false;
              buildingsKemacetanLayer.popupEnabled = false;
              buildingsAirBersihLayer.popupEnabled = false;
              buildingsLayer.popupEnabled = false;
              view.on("click", function (event) {
                // Remove the previous highlights
                if (highlight) {
                  highlight.remove();
                }
                let pointBuildings = event.mapPoint;

                view.whenLayerView(buildingsLayer).then(function (buildingsLayerView) {
                  var query = buildingsLayer.createQuery();
                  query.geometry = pointBuildings;
                  buildingsLayerView.queryFeatures(query).then(function (result) {
                    if (result.features.length > 0) {
                      result.features.forEach(function (feature) {
                        var objectId = feature.attributes.objectid_1;
                        // Highlight the feature passing the objectId to the method
                        highlight = buildingsLayerView.highlight(objectId);
                        setSelectBuildings(false);
                        setRunAnalysis(true);
                        setInputX(event.mapPoint.x);
                        setInputY(event.mapPoint.y);
                      });
                    } else {
                      setSelectBuildings(true);
                      setRunAnalysis(false);
                      setInputX(0);
                      setInputY(0);
                      setResultAnalysis(false);
                      setResPersilTanah({});
                    }
                  });
                });
              });
            };
            document.getElementById("markingBuildings").addEventListener("click", handleMarking);
            // end marking building

            // start legend
            const legend = new Legend({
              container: document.createElement("div"),
              view: view,
              layerInfos: [
                { layer: airBersihPdamLayer },
                { layer: kemacetanJaringanJalanLayer },
                { layer: polaRuangLayer },
                { layer: persilTanahLayer },
                { layer: sampahTpsLayer },
                { layer: buildingPersampahanLayer },
                { layer: buildingsKemacetanLayer },
                { layer: buildingsAirBersihLayer },
                { layer: buildingsLayer },
              ],
            });
            const legendExpand = new Expand({
              expandIconClass: "esri-icon-drag-horizontal",
              expandTooltip: "Legend",
              view: view,
              content: legend.domNode,
            });
            view.ui.add({
              component: legendExpand,
              position: "top-left",
            });
            // end legend

            // start daylight
            const daylight = new Daylight({
              view,
              visibleElements: {
                timezone: false,
                datePicker: false,
                shadowsToggle: false,
              },
            });

            const daylightExpand = new Expand({
              expandIconClass: "esri-icon-lightbulb",
              expandTooltip: "Daylight",
              view,
              content: daylight,
            });

            view.ui.add({
              component: daylightExpand,
              position: "top-left",
            });
            // end daylight
          });

          setStateView(view);

          return { view };
        }
      );
      setModules(lModules);
    }
    return () => {
      isMounted = false;
    };
  }, [mapLoaded]);

  // start run analysis
  const handleRunAnalysis = () => {
    setLoaded(!loaded);
    Axios.get(
      config.url.ARCGIS_URL +
        "/KDBKLB/KDBKLB_PersilTanah_Pabaton/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=" +
        document.getElementById("inputX").value +
        "%2C" +
        document.getElementById("inputY").value +
        "&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=pjson"
    )
      .then(function (response) {
        // handle success
        if (response.data.features.length > 0) {
          let featuresPersilTanah = response.data.features;
          console.log(featuresPersilTanah[0].attributes.nib);
          //setResultAnalysis(true);
          //setResPersilTanah(featuresPersilTanah[0].attributes);
          Axios.post(config.url.API_URL + "/Pembangunan/ExecuteSpPembangunanOptimum?nib=" + featuresPersilTanah[0].attributes.nib)
            .then(function (response) {
              console.log(response);
              if (response.status === 200) {
                //Swal.fire("Success", "Your analysis has been running successfully.", "success");
                Swal.fire({
                  title: "Success",
                  text: "Your analysis has been running successfully!",
                  icon: "success",
                  showCancelButton: false,
                  confirmButtonColor: "#3085d6",
                  confirmButtonText: "OK",
                }).then((result) => {
                  setLoaded(!loaded);
                  if (result.isConfirmed) {
                    history.go(0);
                  }
                });
              }
            })
            .catch(function (error) {
              console.log("error check", error);
            });
        }
      })
      .catch(function (error) {
        // handle error
        console.log("error check", error);
      });
  };
  // end run analysis

  // start marking reset
  const handleMarkingReset = () => {
    setMapLoaded(true);
    stateView.graphics.removeAll();
    stateView.container.classList.remove("screenshotCursor");
  };
  // end marking reset

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="simulasi" />
        {/* Form Simulasi */}
        {/* <div className="sidebar sidebar-offcanvas p-4" id="sidebar" style={form.namaproyek ? { display: "none" } : { overflowX: "auto", height: "calc(100vh - 60px)", backgroundColor: "#fafafb" }}>
          <p className="font-weight-bold">Simulasi Project</p>
          <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="namaproyek">Nama Proyek</label>
              <input className="form-control p-input" id="namaproyek" name="namaproyek" defaultValue="" placeholder="Nama Proyek" ref={register({ required: true })} />
              {errors.namaproyek && (
                <small id="usernameHelp" className="form-text text-danger">
                  Project Name is required
                </small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="provinsi">Provinsi</label>
              <Controller
                name="provinsi"
                control={control}
                defaultValue={null}
                render={props =>
                  <select className="form-control" id="provinsi" name="provinsi" value={province} onChange={handleProvinceChange} ref={register}>
                    {provinces}
                  </select>
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="kota">Kota</label>
              <Controller
                name="kota"
                control={control}
                defaultValue={null}
                render={props =>
                  <select className="form-control" id="kota" name="kota" value={city} onChange={handleCityChange} ref={register}>
                    {cities}
                  </select>
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="data">Data</label>
              <select className="form-control" ref={register} id="data" name="data">
                <option value="tes">Tes</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
              </select>
              {errors.data && (
                <small id="usernameHelp" className="form-text text-danger">
                  Data is required
                </small>
              )}
            </div>
            <div className="form-check">
              <p>Pilih Simulasi</p>
              <input className="form-check-input" ref={register({ required: true })} type="checkbox" value="Air Bersih" name="simulasi" id="simulasiAirBersih" style={{ marginLeft: 0 }} />
              <label className="form-check-label" htmlFor="simulasiAirBersih">Air Bersih</label>
              <input className="form-check-input" ref={register({ required: true })} type="checkbox" value="Kemacetan" name="simulasi" id="simulasiKemacetan" style={{ marginLeft: 0 }} />
              <label className="form-check-label" htmlFor="simulasiKemacetan">Kemacetan</label>
              <input className="form-check-input" ref={register({ required: true })} type="checkbox" value="Sampah" name="simulasi" id="simulasiSampah" style={{ marginLeft: 0 }} />
              <label className="form-check-label" htmlFor="simulasiSampah">Sampah</label>
              <input className="form-check-input" ref={register({ required: true })} type="checkbox" value="KDBKLB" name="simulasi" id="simulasiKDBKLB" style={{ marginLeft: 0 }} />
              <label className="form-check-label" htmlFor="simulasiKDBKLB">KDBKLB</label>
              {errors.simulasi && (
                <small id="usernameHelp" className="form-text text-danger">
                  Simulasi is required
                </small>
              )}
            </div>
            <div className="form-group">
              <button className="btn btn-success" type="submit">Terapkan</button>
            </div>
          </form>
        </div> */}
        {/* End Form Simulasi */}
        <div className="main-panel">
          <div className="container-scroller">
            <DarkBackground disappear={!loaded}>
              <LoadingOverlay active={true} spinner text="Running Analysis..."></LoadingOverlay>
            </DarkBackground>
            <div style={style.viewDiv} ref={mapRef} />
            <div id="layerListExpDiv" className="esri-widget"></div>
            <div id="legendExpDiv" className="esri-widget"></div>
            <div id="buildingsExpDiv" className="esri-widget">
              <div className="esri-component esri-widget" style={{ background: "#fff", width: "300px" }}>
                <form className="esri-feature-form__form" style={{ padding: "5px" }}>
                  {selectBuildings && (
                    <div>
                      <label className="esri-feature-form__label">Select Building</label>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="esri-button"
                          id="markingBuildings"
                          type="button"
                          title="Marking"
                          style={{
                            marginTop: "5px",
                            marginBottom: "5px",
                            marginRight: "2px",
                          }}
                        >
                          Select
                        </button>
                        <button
                          className="esri-button"
                          id="markingBuildingsReset"
                          type="button"
                          title="Cancel"
                          style={{
                            marginTop: "5px",
                            marginBottom: "5px",
                            marginLeft: "2px",
                          }}
                          onClick={() => handleMarkingReset()}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {runAnalysis && (
                    <div>
                      {" "}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="esri-button"
                          id="handleRunAnalysis"
                          type="button"
                          title="Run Analysis"
                          style={{
                            marginTop: "5px",
                            marginBottom: "5px",
                            marginRight: "2px",
                          }}
                          onClick={() => handleRunAnalysis()}
                        >
                          Run Analysis
                        </button>
                      </div>
                    </div>
                  )}
                  <input name="inputX" id="inputX" type="hidden" defaultValue={inputX === 0 ? 0 : inputX} />
                  <input name="inputY" id="inputY" type="hidden" defaultValue={inputY === 0 ? 0 : inputY} />
                </form>
              </div>
            </div>
            {resultAnalysis && (
              <div
                id="resultAnalysis"
                style={{
                  background: "#fff",
                  width: "300px",
                  height: "354px",
                  overflowY: "auto",
                  position: "absolute",
                  top: "55px",
                  right: "54px",
                }}
                className="esri-widget"
              >
                <div className="esri-component esri-widget">
                  <h3>NIB: {resPersilTanah.nib}</h3>
                </div>
              </div>
            )}
          </div>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
};
const style = {
  viewDiv: {
    padding: 0,
    margin: 0,
    height: "calc(100vh - 60px)",
    // height: "100vh",
    // height: "380px",
    width: "100%",
    fallbacks: [{ width: "-moz-calc(100vh - 110px)" }, { width: "-webkit-calc(100vh - 110px)" }, { width: "-o-calc(100vh - 110px)" }],
  },
};

export default SimulasiMap;
