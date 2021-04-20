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

import { TabsModule, TabModuleButton, TabModuleText, TabModuleContent } from "./tabModule";

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

  const [activeTab, setActiveTab] = useState(0);
  const handleClickActiveTab = (e) => {
    const index = parseInt(e.target.id, 0);
    if (index !== activeTab) {
      setActiveTab(index);
    }
  };
  const [activeModuleResTab, setActiveModuleResTab] = useState(0);
  const handleClickActiveModuleResTab = (e) => {
    const index = parseInt(e.target.id, 0);
    if (index !== activeModuleResTab) {
      setActiveModuleResTab(index);
    }
  };

  const [showingPopup, setShowingPopop] = useState({
    show: false,
  });

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
          "esri/intl",
          "esri/widgets/Bookmarks",
          "esri/webmap/Bookmark",
        ],
        {
          css: true,
          version: "4.18",
        }
      ).then(
        ([
          Map,
          SceneView,
          FeatureLayer,
          Legend,
          watchUtils,
          Expand,
          Graphic,
          Query,
          Editor,
          LayerList,
          Daylight,
          VectorTileLayer,
          MapImageLayer,
          intl,
          Bookmarks,
          Bookmark,
        ]) => {
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
            type: "simple", // autocasts as new UniqueValueRenderer()
            symbol: getSymbol("#B2B2B2"),
            visualVariables: [
              {
                type: "size",
                field: "jlh_lantai",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const buildingsLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Bangunan/FeatureServer/0",
            renderer: renderer,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Bangunan",
            popupTemplate: {
              title: "Bangunan",
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

          function getSymbolBuildingsEnvelope(color) {
            return {
              type: "polygon-3d", // autocasts as new PolygonSymbol3D()
              symbolLayers: [
                {
                  type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
                  material: {
                    color: "rgba(178, 178, 178, 0.5)",
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
          const rendererBuildingsEnvelope = {
            type: "simple", // autocasts as new UniqueValueRenderer()
            symbol: getSymbolBuildingsEnvelope("#B2B2B2"),
            visualVariables: [
              {
                type: "size",
                field: "jlh_lantai",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const buildingsEnvelopeLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Hosted/Amplop_Bangunan_WFL1/FeatureServer/0",
            renderer: rendererBuildingsEnvelope,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Bangunan - Envelope",
            popupTemplate: {
              title: "Bangunan - Envelope",
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

          function getSymbolKdbKlb(color) {
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
          const rendererKdbKlb = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbolKdbKlb("#B2B2B2"),
            defaultLabel: "Eksisting",
            field: "status_kdbklb",
            uniqueValueInfos: [
              {
                value: "Diizinkan",
                symbol: getSymbolKdbKlb("#38A800"),
                label: "Diizinkan",
              },
              {
                value: "Ditolak/rekomendasi",
                symbol: getSymbolKdbKlb("#E64C00"),
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
          const buildingsKdbKlbLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/KDBKLB/KDBKLB_Bangunan/FeatureServer/0",
            renderer: rendererKdbKlb,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Bangunan - Pembangunan Optimum",
            popupTemplate: {
              title: "Bangunan - Pembangunan Optimum",
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
            editingEnabled: false,
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
            title: "Bangunan - Air Bersih",
            popupTemplate: {
              title: "Bangunan - Air Bersih",
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
            editingEnabled: false,
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
            title: "Bangunan - Transportasi",
            popupTemplate: {
              title: "Bangunan - Transportasi",
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
            editingEnabled: false,
          });

          const persilTanahKdbKlbLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/KDBKLB/KDBKLB_PersilTanah_Pabaton/FeatureServer/0",
            title: "Persil Tanah - Pembangunan Optimum",
            popupTemplate: {
              title: "Persil Tanah - Pembangunan Optimum",
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
            editingEnabled: false,
          });

          const persilTanahAirBersihLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Air/Persil_Tanah_Air_Bersih/FeatureServer/0",
            title: "Persil Tanah - Air Bersih",
            popupTemplate: {
              title: "Persil Tanah - Air Bersih",
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
            editingEnabled: false,
          });

          const persilTanahKemacetanLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Kemacetan/PersilTanah_Transportasi/FeatureServer/0",
            title: "Persil Tanah - Transportasi",
            popupTemplate: {
              title: "Persil Tanah - Transportasi",
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
            editingEnabled: false,
          });

          function getSymbolPolaRuangEnvelope(color) {
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
          const rendererPolaRuangEnvelope = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbolPolaRuangEnvelope("#B2B2B2"),
            defaultLabel: "Lainnya",
            field: "namobj",
            uniqueValueInfos: [
              {
                value: "Badan Air",
                symbol: getSymbolPolaRuangEnvelope("#73DFFF"),
                label: "Badan Air",
              },
              {
                value: "Badan Jalan",
                symbol: getSymbolPolaRuangEnvelope("#E60000"),
                label: "Badan Jalan",
              },
              {
                value: "Instalasi Pengolahan Air Limbah (IPAL)",
                symbol: getSymbolPolaRuangEnvelope("#686868"),
                label: "Instalasi Pengolahan Air Limbah (IPAL)",
              },
              {
                value: "Kawasan Peruntukan Industri",
                symbol: getSymbolPolaRuangEnvelope("#ADBACA"),
                label: "Kawasan Peruntukan Industri",
              },
              {
                value: "Pemakaman",
                symbol: getSymbolPolaRuangEnvelope("#686868"),
                label: "Pemakaman",
              },
              {
                value: "Pembangkitan Tenaga Listrik",
                symbol: getSymbolPolaRuangEnvelope("#828282"),
                label: "Pembangkitan Tenaga Listrik",
              },
              {
                value: "Perdagangan dan Jasa Skala BWP",
                symbol: getSymbolPolaRuangEnvelope("#FF0000"),
                label: "Perdagangan dan Jasa Skala BWP",
              },
              {
                value: "Perdagangan dan Jasa Skala Kota",
                symbol: getSymbolPolaRuangEnvelope("#FF0000"),
                label: "Perdagangan dan Jasa Skala Kota",
              },
              {
                value: "Perdagangan dan Jasa Skala Sub BWP",
                symbol: getSymbolPolaRuangEnvelope("#FF0000"),
                label: "Perdagangan dan Jasa Skala Sub BWP",
              },
              {
                value: "Perkantoran",
                symbol: getSymbolPolaRuangEnvelope("#6F4489"),
                label: "Perkantoran",
              },
              {
                value: "Pertahanan dan Keamanan",
                symbol: getSymbolPolaRuangEnvelope("#728943"),
                label: "Pertahanan dan Keamanan",
              },
              {
                value: "Perumahan dan Perdagangan/Jasa",
                symbol: getSymbolPolaRuangEnvelope("#FF7F7F"),
                label: "Perumahan dan Perdagangan/Jasa",
              },
              {
                value: "Resapan Air",
                symbol: getSymbolPolaRuangEnvelope("#E8FFE0"),
                label: "Resapan Air",
              },
              {
                value: "Rimba Kota",
                symbol: getSymbolPolaRuangEnvelope("#4CE600"),
                label: "Rimba Kota",
              },
              {
                value: "Rumah Kepadatan Rendah",
                symbol: getSymbolPolaRuangEnvelope("#FFFFBF"),
                label: "Rumah Kepadatan Rendah",
              },
              {
                value: "Rumah Kepadatan Sangat Tinggi",
                symbol: getSymbolPolaRuangEnvelope("#FEFF99"),
                label: "Rumah Kepadatan Sangat Tinggi",
              },
              {
                value: "Rumah Kepadatan Sedang",
                symbol: getSymbolPolaRuangEnvelope("#FEFF73"),
                label: "Rumah Kepadatan Sedang",
              },
              {
                value: "Rumah Kepadatan Tinggi",
                symbol: getSymbolPolaRuangEnvelope("#FFFF4D"),
                label: "Rumah Kepadatan Tinggi",
              },
              {
                value: "SPU Kesehatan Skala Kecamatan",
                symbol: getSymbolPolaRuangEnvelope("#D4FCE7"),
                label: "SPU Kesehatan Skala Kecamatan",
              },
              {
                value: "Sempadan Sungai",
                symbol: getSymbolPolaRuangEnvelope("#C3FFCC"),
                label: "Sempadan Sungai",
              },
              {
                value: "Taman Kecamatan",
                symbol: getSymbolPolaRuangEnvelope("#CEFCC7"),
                label: "Taman Kecamatan",
              },
              {
                value: "Taman Kelurahan",
                symbol: getSymbolPolaRuangEnvelope("#B3FCBF"),
                label: "Taman Kelurahan",
              },
              {
                value: "Taman Kota",
                symbol: getSymbolPolaRuangEnvelope("#A5FF3D"),
                label: "Taman Kota",
              },
              {
                value: "Taman RW",
                symbol: getSymbolPolaRuangEnvelope("#A5FF3D"),
                label: "Taman RW",
              },
              {
                value: "Transportasi",
                symbol: getSymbolPolaRuangEnvelope("#FF2732"),
                label: "Transportasi",
              },
              {
                value: "Zona Penyangga",
                symbol: getSymbolPolaRuangEnvelope("#AAFF00"),
                label: "Zona Penyangga",
              },
            ],
            visualVariables: [
              {
                type: "size",
                field: "lantai_max",
                valueUnit: "meters", // Converts and extrudes all data values in meters
              },
            ],
          };
          const polaRuangEnvelopeLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Hosted/Amplop_Zonasi_WFL1/FeatureServer/0",
            renderer: rendererPolaRuangEnvelope,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Zonasi - Envelope",
            popupTemplate: {
              title: "Zonasi - Envelope",
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
                  ],
                },
              ],
            },
            outFields: ["*"],
            editingEnabled: false,
          });

          const polaRuangKdbKlbLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/KDBKLB/KDBKLB_PolaRuang/FeatureServer/0",
            title: "Zonasi - Pembangunan Optimum",
            popupTemplate: {
              title: "Zonasi - Pembangunan Optimum",
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
            editingEnabled: false,
          });

          const polaRuangAirBersihLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Air/Zonasi_AirBersih/FeatureServer/0",
            title: "Zonasi - Air Bersih",
            popupTemplate: {
              title: "Zonasi - Air Bersih",
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
            editingEnabled: false,
          });

          const polaRuangKemacetanLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Kemacetan/Zonasi_Transportasi/FeatureServer/0",
            title: "Zonasi - Transportasi",
            popupTemplate: {
              title: "Zonasi - Transportasi",
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
            editingEnabled: false,
          });

          const kemacetanJaringanJalanLayer = new MapImageLayer({
            url: config.url.ARCGIS_URL + "/Kemacetan/kemacetan_jaringan_jalan/MapServer",
            title: "Jaringan Jalan",
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

          const polaRuangVersioningLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/PolaRuang_verioning/FeatureServer/0",
            title: "Pola Ruang Versioning",
            popupTemplate: {
              title: "Pola Ruang Versioning",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
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
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          const basemapPolaRuangLayer = new VectorTileLayer({
            url: config.url.ARCGIS_URL + "/Hosted/KDBKLB_PolaRuang_base/VectorTileServer",
            title: "Basemap Pola Ruang",
          });

          map.addMany([
            basemapPolaRuangLayer,
            polaRuangVersioningLayer,
            airBersihPdamLayer,
            kemacetanJaringanJalanLayer,
            polaRuangKemacetanLayer,
            polaRuangAirBersihLayer,
            polaRuangKdbKlbLayer,
            polaRuangEnvelopeLayer,
            persilTanahKemacetanLayer,
            persilTanahAirBersihLayer,
            persilTanahKdbKlbLayer,
            buildingsKemacetanLayer,
            buildingsAirBersihLayer,
            buildingsKdbKlbLayer,
            buildingsEnvelopeLayer,
            buildingsLayer,
          ]);

          basemapPolaRuangLayer.visible = false;
          airBersihPdamLayer.visible = false;
          kemacetanJaringanJalanLayer.visible = false;
          polaRuangKemacetanLayer.visible = false;
          polaRuangAirBersihLayer.visible = false;
          polaRuangKdbKlbLayer.visible = false;
          polaRuangEnvelopeLayer.visible = false;
          persilTanahKemacetanLayer.visible = false;
          persilTanahAirBersihLayer.visible = false;
          persilTanahKdbKlbLayer.visible = false;
          buildingsKemacetanLayer.visible = false;
          buildingsAirBersihLayer.visible = false;
          buildingsKdbKlbLayer.visible = false;
          buildingsEnvelopeLayer.visible = false;

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
              expandTooltip: "Daftar Layer",
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
              layerInfos: [
                {
                  layer: polaRuangVersioningLayer,
                  enabled: true,
                  addEnabled: true,
                  updateEnabled: true,
                  deleteEnabled: true,
                  fieldConfig: [
                    {
                      name: "namzon",
                      label: "namzon",
                    },
                    {
                      name: "kodzon",
                      label: "kodzon",
                    },
                    {
                      name: "namszn",
                      label: "namszn",
                    },
                    {
                      name: "kodszn",
                      label: "kodszn",
                    },
                    {
                      name: "kdb",
                      label: "kdb",
                    },
                    {
                      name: "klb",
                      label: "klb",
                    },
                    {
                      name: "kdh",
                      label: "kdh",
                    },
                    {
                      name: "lantai_max",
                      label: "lantai_max",
                    },
                  ],
                },
              ],
            });
            const editorExpand = new Expand({
              expandIconClass: "esri-icon-edit",
              expandTooltip: "Edit Layer",
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
              expandTooltip: "Pilih Gedung",
              content: document.getElementById("buildingsExpDiv"),
              view: view,
            });
            view.ui.add({
              component: buildingsExp,
              position: "top-left",
            });
            const handleMarking = () => {
              view.container.classList.add("screenshotCursor");
              polaRuangVersioningLayer.popupEnabled = false;
              airBersihPdamLayer.popupEnabled = false;
              kemacetanJaringanJalanLayer.popupEnabled = false;
              polaRuangKemacetanLayer.popupEnabled = false;
              polaRuangAirBersihLayer.popupEnabled = false;
              polaRuangKdbKlbLayer.popupEnabled = false;
              polaRuangEnvelopeLayer.popupEnabled = false;
              persilTanahKemacetanLayer.popupEnabled = false;
              persilTanahAirBersihLayer.popupEnabled = false;
              persilTanahKdbKlbLayer.popupEnabled = false;
              buildingsKemacetanLayer.popupEnabled = false;
              buildingsAirBersihLayer.popupEnabled = false;
              buildingsKdbKlbLayer.popupEnabled = false;
              buildingsEnvelopeLayer.popupEnabled = false;
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
                { layer: polaRuangVersioningLayer },
                { layer: airBersihPdamLayer },
                { layer: kemacetanJaringanJalanLayer },
                { layer: polaRuangKemacetanLayer },
                { layer: polaRuangAirBersihLayer },
                { layer: polaRuangKdbKlbLayer },
                { layer: polaRuangEnvelopeLayer },
                { layer: persilTanahKemacetanLayer },
                { layer: persilTanahAirBersihLayer },
                { layer: persilTanahKdbKlbLayer },
                { layer: buildingsKemacetanLayer },
                { layer: buildingsAirBersihLayer },
                { layer: buildingsKdbKlbLayer },
                { layer: buildingsLayer },
              ],
            });
            const legendExpand = new Expand({
              expandIconClass: "esri-icon-drag-horizontal",
              expandTooltip: "Legenda",
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
              expandTooltip: "Cahaya Matahari",
              view,
              content: daylight,
            });

            view.ui.add({
              component: daylightExpand,
              position: "top-left",
            });
            // end daylight

            // start locale to Indon
            intl.setLocale("id");
            // end locale

            // start bookmarks
            const bookmarks = new Bookmarks({
              view: view,
              bookmarks: [
                new Bookmark({
                  name: "Bogor, Pabaton",
                  viewpoint: {
                    targetGeometry: {
                      type: "extent",
                      spatialReference: {
                        wkid: 102100,
                      },
                      xmin: 11887279.83,
                      ymin: -736082.13,
                      xmax: 11889610.93,
                      ymax: -734253.33,
                    },
                  },
                }),
                new Bookmark({
                  name: "Bengkalis",
                  viewpoint: {
                    targetGeometry: {
                      type: "extent",
                      spatialReference: {
                        wkid: 102100,
                      },
                      xmin: 11307182.57,
                      ymin: 212556.4,
                      xmax: 11341104.52,
                      ymax: 239168.92,
                    },
                  },
                }),
                new Bookmark({
                  name: "Kota Kediri",
                  viewpoint: {
                    targetGeometry: {
                      type: "extent",
                      spatialReference: {
                        latestWkid: 3857,
                        wkid: 102100,
                      },
                      xmin: 12459226.85,
                      ymin: -882133.1,
                      xmax: 12480936.9,
                      ymax: -865101.09,
                    },
                  },
                }),
              ],
            });

            // Add the widget to the top-right corner of the view
            const bookmarksExpand = new Expand({
              expandIconClass: "esri-icon-bookmark",
              expandTooltip: "Bookmarks",
              view,
              content: bookmarks,
            });

            view.ui.add({
              component: bookmarksExpand,
              position: "top-left",
            });
            // end bookmarks
          });

          view.popup.watch("features", (features) => {
            if (features[0]) {
              console.log(features[0]);
              setShowingPopop({
                ...showingPopup,
                show: !showingPopup.show,
              });
            }
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
                  title: "Berhasil",
                  text: "Analisis Anda berhasil dilakukan!",
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

  // start close showing popup
  const handleCloseShowingPopup = () => {
    console.log(stateView);
    stateView.popup.close();
    setShowingPopop({ ...showingPopup, show: false });
  };
  // end close showing popup

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="simulasi" />
        {/* Form Simulasi */}
        {/* <div className="sidebar sidebar-offcanvas p-4 simulasi-map-form" id="sidebar" style={form.namaproyek ? { display: "none" } : { overflowX: "auto", height: "calc(100vh - 60px)", backgroundColor: "#fafafb" }}>
          <p className="font-weight-bold">Simulasi Project</p>
          <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="namaproyek">Nama Proyek</label>
              <input className="form-control p-input" id="namaproyek" name="namaproyek" defaultValue="" placeholder="Nama Proyek" ref={register({ required: true })} />
              {errors.namaproyek && (
                <small id="usernameHelp" className="form-text text-danger">
                  Nama proyek harus diisi
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
              <LoadingOverlay active={true} spinner text="Menjalankan analisis..."></LoadingOverlay>
            </DarkBackground>
            <div style={style.viewDiv} ref={mapRef} />
            {showingPopup.show && (
              <div
                style={{
                  borderLeft: "1px solid #CED4DA",
                  display: "block",
                  position: "fixed",
                  top: "60px",
                  right: "0",
                  bottom: "0",
                  zIndex: "9999",
                  width: "350px",
                  height: "100vh",
                  minHeight: "100%",
                  background: "#F8FAFC",
                }}
              >
                <i
                  className="ti-close"
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    color: "#fff",
                    background: "transparent",
                    borderRadius: "4px",
                    padding: "0 3px",
                    cursor: "pointer",
                    zIndex: "1",
                  }}
                  onClick={() => handleCloseShowingPopup()}
                />
                <p
                  style={{
                    padding: "16px 0 13px 35px",
                    fontSize: "0.875rem",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: "500",
                    lineHeight: "1",
                    color: "rgb(255 255 255 / 90%)",
                    opacity: "0.9",
                    marginBottom: "0",
                    borderTop: "1px solid #CED4DA",
                    background: "#0A156A",
                  }}
                >
                  SIMULASI INFORMATION
                </p>
                <TabsModule>
                  <div style={{ flex: "1", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <TabModuleButton onClick={handleClickActiveTab} activeTab={activeTab === 0} id={0} style={{ background: "#6D8392" }}>
                      <img onClick={handleClickActiveTab} activeTab={activeTab === 0} id={0} src="./images/office-building.svg" alt="KDB/KLB" />
                    </TabModuleButton>
                    <TabModuleText onClick={handleClickActiveTab} activeTab={activeTab === 0} id={0}>
                      KDB/KLB
                    </TabModuleText>
                  </div>
                  <div
                    style={{
                      flex: "1",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <TabModuleButton onClick={handleClickActiveTab} activeTab={activeTab === 1} id={1} style={{ background: "#EB5569" }}>
                      <img onClick={handleClickActiveTab} activeTab={activeTab === 1} id={1} src="./images/traffic-lights.svg" alt="KEMACETAN" />
                    </TabModuleButton>
                    <TabModuleText onClick={handleClickActiveTab} activeTab={activeTab === 1} id={1}>
                      KEMACETAN
                    </TabModuleText>
                  </div>
                  <div style={{ flex: "1", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <TabModuleButton onClick={handleClickActiveTab} activeTab={activeTab === 2} id={2} style={{ background: "#6EAABA" }}>
                      <img onClick={handleClickActiveTab} activeTab={activeTab === 2} id={2} src="./images/water.svg" alt="AIR BERSIH" />
                    </TabModuleButton>
                    <TabModuleText onClick={handleClickActiveTab} activeTab={activeTab === 2} id={2}>
                      AIR BERSIH
                    </TabModuleText>
                  </div>
                </TabsModule>
                <>
                  <TabModuleContent activeTab={activeTab === 0}>
                    <TabsModule style={{ height: "45px" }}>
                      <TabModuleButton
                        onClick={handleClickActiveModuleResTab}
                        activeTab={activeModuleResTab === 0}
                        id={0}
                        style={{ borderRadius: "0px", fontSize: "14px", background: "#0A156A", width: "auto" }}
                      >
                        Bangunan
                      </TabModuleButton>
                      <TabModuleButton
                        onClick={handleClickActiveModuleResTab}
                        activeTab={activeModuleResTab === 1}
                        id={1}
                        style={{ borderRadius: "0px", fontSize: "14px", background: "#0A156A", width: "auto" }}
                      >
                        Persil Tanah
                      </TabModuleButton>
                      <TabModuleButton
                        onClick={handleClickActiveModuleResTab}
                        activeTab={activeModuleResTab === 2}
                        id={2}
                        style={{ borderRadius: "0px", fontSize: "14px", background: "#0A156A", width: "auto" }}
                      >
                        Pola Ruang
                      </TabModuleButton>
                    </TabsModule>
                    <>
                      <TabModuleContent activeTab={activeModuleResTab === 0}>
                        <div className="fade-in">
                          <h4>KDB/KLB Bangunan</h4>
                        </div>
                      </TabModuleContent>
                      <TabModuleContent activeTab={activeModuleResTab === 1}>
                        <div className="fade-in">
                          <h4>KDB/KLB Persil Tanah</h4>
                        </div>
                      </TabModuleContent>
                      <TabModuleContent activeTab={activeModuleResTab === 2}>
                        <div className="fade-in">
                          <h4>KDB/KLB Pola Ruang</h4>
                        </div>
                      </TabModuleContent>
                    </>
                  </TabModuleContent>
                  <TabModuleContent activeTab={activeTab === 1}>
                    <div className="fade-in">
                      <h1>Content 2</h1>
                    </div>
                  </TabModuleContent>
                  <TabModuleContent activeTab={activeTab === 2}>
                    <div className="fade-in">
                      <h1>Content 3</h1>
                    </div>
                  </TabModuleContent>
                </>
              </div>
            )}
            <div id="layerListExpDiv" className="esri-widget"></div>
            <div id="legendExpDiv" className="esri-widget"></div>
            <div id="buildingsExpDiv" className="esri-widget">
              <div className="esri-component esri-widget" style={{ background: "#fff", width: "300px" }}>
                <form className="esri-feature-form__form" style={{ padding: "5px" }}>
                  {selectBuildings && (
                    <div>
                      <label className="esri-feature-form__label">Pilih Bangunan</label>
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
                          Pilih
                        </button>
                        <button
                          className="esri-button"
                          id="markingBuildingsReset"
                          type="button"
                          title="Batal"
                          style={{
                            marginTop: "5px",
                            marginBottom: "5px",
                            marginLeft: "2px",
                          }}
                          onClick={() => handleMarkingReset()}
                        >
                          Batal
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
                          title="Jalankan Analisis"
                          style={{
                            marginTop: "5px",
                            marginBottom: "5px",
                            marginRight: "2px",
                          }}
                          onClick={() => handleRunAnalysis()}
                        >
                          Jalankan Analisis
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
