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
    title: "",
  });

  const [contentGeneral, setContentGeneral] = useState([]);
  const [contentPersilTanah, setContentPersilTanah] = useState([]);
  const [contentPolaRuang, setContentPolaRuang] = useState([]);

  const [contentBangunanKdbKlb, setContentBangunanKdbKlb] = useState([]);
  const [hasilSimulasiBangunanKdbKlb, setHasilSimulasiBangunanKdbKlb] = useState("");
  const [hasilWarnaBangunanKdbKlb, setHasilWarnaBangunanKdbKlb] = useState("");
  const [contentHasilPersilTanahKdbKlb, setContentHasilPersilTanahKdbKlb] = useState({});
  const [contentHasilPolaRuangKdbKlb, setContentHasilPolaRuangKdbKlb] = useState({});
  const [hasilWarnaPersilTanahKdbKlb, setHasilWarnaPersilTanahKdbKlb] = useState("");
  const [hasilWarnaPolaRuangKdbKlb, setHasilWarnaPolaRuangKdbKlb] = useState("");

  const [contentBangunanKemacetan, setContentBangunanKemacetan] = useState([]);
  const [hasilSimulasiBangunanKemacetan, setHasilSimulasiBangunanKemacetan] = useState("");
  const [hasilWarnaBangunanKemacetan, setHasilWarnaBangunanKemacetan] = useState("");
  const [contentHasilPersilTanahKemacetan, setContentHasilPersilTanahKemacetan] = useState({});
  const [contentHasilPolaRuangKemacetan, setContentHasilPolaRuangKemacetan] = useState({});
  const [hasilWarnaPersilTanahKemacetan, setHasilWarnaPersilTanahKemacetan] = useState("");
  const [hasilWarnaPolaRuangKemacetan, setHasilWarnaPolaRuangKemacetan] = useState("");

  const [contentBangunanAirBersih, setContentBangunanAirBersih] = useState([]);
  const [hasilSimulasiBangunanAirBersih, setHasilSimulasiBangunanAirBersih] = useState("");
  const [hasilWarnaBangunanAirBersih, setHasilWarnaBangunanAirBersih] = useState("");
  const [contentHasilPersilTanahAirBersih, setContentHasilPersilTanahAirBersih] = useState({});
  const [contentHasilPolaRuangAirBersih, setContentHasilPolaRuangAirBersih] = useState({});
  const [hasilWarnaPersilTanahAirBersih, setHasilWarnaPersilTanahAirBersih] = useState("");
  const [hasilWarnaPolaRuangAirBersih, setHasilWarnaPolaRuangAirBersih] = useState("");
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
          "esri/layers/GroupLayer",
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
          GroupLayer,
        ]) => {
          const map = new Map({
            basemap: "topo-vector",
            ground: "world-elevation",
          });

          const view = new SceneView({
            container: mapRef.current,
            map: map,
            camera: {
              position: [106.7936983, -6.5969447, 682.98652],
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
                    color: "rgba(178, 178, 178, 1)",
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
            field: "melampaui_tinggi",
            uniqueValueInfos: [
              {
                value: "Belum melampaui jumlah lantai maksimal",
                symbol: getSymbolKdbKlb([255, 255, 0]),
                label: "Belum melampaui jumlah lantai maksimal",
              },
              {
                value: "Melampaui jumlah lantai maksimal",
                symbol: getSymbolKdbKlb([255, 0, 0]),
                label: "Melampaui jumlah lantai maksimal",
              },
              {
                value: "Jumlah lantai sudah maksimal",
                symbol: getSymbolKdbKlb([76, 230, 0]),
                label: "Jumlah lantai sudah maksimal",
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
                    {
                      fieldName: "jlh_lantai_sebelum",
                      label: "jlh_lantai_sebelum",
                    },
                    {
                      fieldName: "luas_m2_sebelum",
                      label: "luas_m2_sebelum",
                    },
                    {
                      fieldName: "fa_sebelum",
                      label: "fa_sebelum",
                    },
                    {
                      fieldName: "melampaui_fa_sebelum",
                      label: "melampaui_fa_sebelum",
                    },
                    {
                      fieldName: "melampaui_tinggi_sebelum",
                      label: "melampaui_tinggi_sebelum",
                    },
                    {
                      fieldName: "status_kdbklb_sebelum",
                      label: "status_kdbklb_sebelum",
                    },
                    {
                      fieldName: "izin_air_y5_sebelum",
                      label: "izin_air_y5_sebelum",
                    },
                    {
                      fieldName: "izin_air_y6_sebelum",
                      label: "izin_air_y6_sebelum",
                    },
                    {
                      fieldName: "izin_air_y7_sebelum",
                      label: "izin_air_y7_sebelum",
                    },
                    {
                      fieldName: "izin_air_y8_sebelum",
                      label: "izin_air_y8_sebelum",
                    },
                    {
                      fieldName: "izin_air_y9_sebelum",
                      label: "izin_air_y9_sebelum",
                    },
                    {
                      fieldName: "izin_air_y10_sebelum",
                      label: "izin_air_y10_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y6_sebelum",
                      label: "izin_macet_y6_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y7_sebelum",
                      label: "izin_macet_y7_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y8_sebelum",
                      label: "izin_macet_y8_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y9_sebelum",
                      label: "izin_macet_y9_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y10_sebelum",
                      label: "izin_macet_y10_sebelum",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
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
                    {
                      fieldName: "jlh_lantai_sebelum",
                      label: "jlh_lantai_sebelum",
                    },
                    {
                      fieldName: "luas_m2_sebelum",
                      label: "luas_m2_sebelum",
                    },
                    {
                      fieldName: "fa_sebelum",
                      label: "fa_sebelum",
                    },
                    {
                      fieldName: "melampaui_fa_sebelum",
                      label: "melampaui_fa_sebelum",
                    },
                    {
                      fieldName: "melampaui_tinggi_sebelum",
                      label: "melampaui_tinggi_sebelum",
                    },
                    {
                      fieldName: "status_kdbklb_sebelum",
                      label: "status_kdbklb_sebelum",
                    },
                    {
                      fieldName: "izin_air_y5_sebelum",
                      label: "izin_air_y5_sebelum",
                    },
                    {
                      fieldName: "izin_air_y6_sebelum",
                      label: "izin_air_y6_sebelum",
                    },
                    {
                      fieldName: "izin_air_y7_sebelum",
                      label: "izin_air_y7_sebelum",
                    },
                    {
                      fieldName: "izin_air_y8_sebelum",
                      label: "izin_air_y8_sebelum",
                    },
                    {
                      fieldName: "izin_air_y9_sebelum",
                      label: "izin_air_y9_sebelum",
                    },
                    {
                      fieldName: "izin_air_y10_sebelum",
                      label: "izin_air_y10_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y6_sebelum",
                      label: "izin_macet_y6_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y7_sebelum",
                      label: "izin_macet_y7_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y8_sebelum",
                      label: "izin_macet_y8_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y9_sebelum",
                      label: "izin_macet_y9_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y10_sebelum",
                      label: "izin_macet_y10_sebelum",
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
                    {
                      fieldName: "jlh_lantai_sebelum",
                      label: "jlh_lantai_sebelum",
                    },
                    {
                      fieldName: "luas_m2_sebelum",
                      label: "luas_m2_sebelum",
                    },
                    {
                      fieldName: "fa_sebelum",
                      label: "fa_sebelum",
                    },
                    {
                      fieldName: "melampaui_fa_sebelum",
                      label: "melampaui_fa_sebelum",
                    },
                    {
                      fieldName: "melampaui_tinggi_sebelum",
                      label: "melampaui_tinggi_sebelum",
                    },
                    {
                      fieldName: "status_kdbklb_sebelum",
                      label: "status_kdbklb_sebelum",
                    },
                    {
                      fieldName: "izin_air_y5_sebelum",
                      label: "izin_air_y5_sebelum",
                    },
                    {
                      fieldName: "izin_air_y6_sebelum",
                      label: "izin_air_y6_sebelum",
                    },
                    {
                      fieldName: "izin_air_y7_sebelum",
                      label: "izin_air_y7_sebelum",
                    },
                    {
                      fieldName: "izin_air_y8_sebelum",
                      label: "izin_air_y8_sebelum",
                    },
                    {
                      fieldName: "izin_air_y9_sebelum",
                      label: "izin_air_y9_sebelum",
                    },
                    {
                      fieldName: "izin_air_y10_sebelum",
                      label: "izin_air_y10_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y6_sebelum",
                      label: "izin_macet_y6_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y7_sebelum",
                      label: "izin_macet_y7_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y8_sebelum",
                      label: "izin_macet_y8_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y9_sebelum",
                      label: "izin_macet_y9_sebelum",
                    },
                    {
                      fieldName: "izin_macet_y10_sebelum",
                      label: "izin_macet_y10_sebelum",
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
                    {
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
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
                    {
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
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
                    {
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
            editingEnabled: false,
          });

          const persilTanahBpn = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/persil_tanah_bpn/FeatureServer/0",
            title: "Persil Tanah - BPN",
            popupTemplate: {
              title: "Persil Tanah - BPN",
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                    {
                      fieldName: "penggunaan",
                      label: "penggunaan",
                    },
                    {
                      fieldName: "nilai",
                      label: "nilai",
                    },
                    {
                      fieldName: "tipehak",
                      label: "tipehak",
                    },
                    {
                      fieldName: "numerikid",
                      label: "numerikid",
                    },
                    {
                      fieldName: "sumbergeom",
                      label: "sumbergeom",
                    },
                    {
                      fieldName: "wilayahid",
                      label: "wilayahid",
                    },
                    {
                      fieldName: "kantorid",
                      label: "kantorid",
                    },
                    {
                      fieldName: "kantorindu",
                      label: "kantorindu",
                    },
                    {
                      fieldName: "tipeproduk",
                      label: "tipeproduk",
                    },
                    {
                      fieldName: "tahun",
                      label: "tahun",
                    },
                    {
                      fieldName: "luas",
                      label: "luas",
                    },
                    {
                      fieldName: "luaspeta",
                      label: "luaspeta",
                    },
                    {
                      fieldName: "nib",
                      label: "nib",
                    },
                    {
                      fieldName: "luasha",
                      label: "luasha",
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
                      fieldName: "gsb",
                      label: "gsb",
                    },
                    {
                      fieldName: "ktb",
                      label: "ktb",
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
            defaultSymbol: getSymbolPolaRuangEnvelope("#828282"),
            defaultLabel: "Lainnya",
            field: "namaszona",
            uniqueValueInfos: [
              {
                value: "Badan Air",
                symbol: getSymbolPolaRuangEnvelope("#73dfff"),
                label: "Badan Air",
              },
              {
                value: "Badan Jalan",
                symbol: getSymbolPolaRuangEnvelope("#ffffff"),
                label: "Badan Jalan",
              },
              {
                value: "Cagar Alam",
                symbol: getSymbolPolaRuangEnvelope("#cfedfc"),
                label: "Cagar Alam",
              },
              {
                value: "Ekosistem Mangrove",
                symbol: getSymbolPolaRuangEnvelope("#43756e"),
                label: "Ekosistem Mangrove",
              },
              {
                value: "Gerakan Tanah",
                symbol: getSymbolPolaRuangEnvelope("#cfedfc"),
                label: "Gerakan Tanah",
              },
              {
                value: "Hortikultura",
                symbol: getSymbolPolaRuangEnvelope("#cfedfc"),
                label: "Hortikultura",
              },
              {
                value: "Hutan Lindung",
                symbol: getSymbolPolaRuangEnvelope("#245724"),
                label: "Hutan Lindung",
              },
              {
                value: "Hutan Produksi Terbatas",
                symbol: getSymbolPolaRuangEnvelope("#b3e6e6"),
                label: "Hutan Produksi Terbatas",
              },
              {
                value: "Hutan Produksi Tetap",
                symbol: getSymbolPolaRuangEnvelope("#99f2cc"),
                label: "Hutan Produksi Tetap",
              },
              {
                value: "Hutan Produksi yang Dapat Dikonversi",
                symbol: getSymbolPolaRuangEnvelope("#fcb3f4"),
                label: "Hutan Produksi yang Dapat Dikonversi",
              },
              {
                value: "Instalasi Pengolahan Air Limbah (IPAL)",
                symbol: getSymbolPolaRuangEnvelope("#c7cba2"),
                label: "Instalasi Pengolahan Air Limbah (IPAL)",
              },
              {
                value: "Instalasi Pengolahan Air Minum (IPAM)",
                symbol: getSymbolPolaRuangEnvelope("#fcb3f4"),
                label: "Instalasi Pengolahan Air Minum (IPAM)",
              },
              {
                value: "Kawasan Industri",
                symbol: getSymbolPolaRuangEnvelope("#fcb3f4"),
                label: "Kawasan Industri",
              },
              {
                value: "Kawasan Peruntukan Industri",
                symbol: getSymbolPolaRuangEnvelope("#adbac9"),
                label: "Kawasan Peruntukan Industri",
              },
              {
                value: "Keunikan Batuan dan Fosil",
                symbol: getSymbolPolaRuangEnvelope("#fcfbb3"),
                label: "Keunikan Batuan dan Fosil",
              },
              {
                value: "Keunikan Bentang Alam",
                symbol: getSymbolPolaRuangEnvelope("#fcfbb3"),
                label: "Keunikan Bentang Alam",
              },
              {
                value: "Keunikan Proses Geologi",
                symbol: getSymbolPolaRuangEnvelope("#fcfbb3"),
                label: "Keunikan Proses Geologi",
              },
              {
                value: "Letusan Gunung Api",
                symbol: getSymbolPolaRuangEnvelope("#fcbeb6"),
                label: "Letusan Gunung Api",
              },
              {
                value: "Lindung Gambut",
                symbol: getSymbolPolaRuangEnvelope("#fcbeb6"),
                label: "Lindung Gambut",
              },
              {
                value: "Lindung Spiritual dan Kearifan Lokal",
                symbol: getSymbolPolaRuangEnvelope("#b8fcd2"),
                label: "Lindung Spiritual dan Kearifan Lokal",
              },
              {
                value: "Pemakaman",
                symbol: getSymbolPolaRuangEnvelope("#e5f4d5"),
                label: "Pemakaman",
              },
              {
                value: "Pembangkitan Tenaga Listrik",
                symbol: getSymbolPolaRuangEnvelope("#ffc000"),
                label: "Pembangkitan Tenaga Listrik",
              },
              {
                value: "Pengembangan Nuklir",
                symbol: getSymbolPolaRuangEnvelope("#b8fcd2"),
                label: "Pengembangan Nuklir",
              },
              {
                value: "Perdagangan dan Jasa Skala BWP",
                symbol: getSymbolPolaRuangEnvelope("#ff8080"),
                label: "Perdagangan dan Jasa Skala BWP",
              },
              {
                value: "Perdagangan dan Jasa Skala Kota",
                symbol: getSymbolPolaRuangEnvelope("#ff6666"),
                label: "Perdagangan dan Jasa Skala Kota",
              },
              {
                value: "Perdagangan dan Jasa Skala Sub BWP",
                symbol: getSymbolPolaRuangEnvelope("#ff9999"),
                label: "Perdagangan dan Jasa Skala Sub BWP",
              },
              {
                value: "Pergudangan",
                symbol: getSymbolPolaRuangEnvelope([199, 203, 163]),
                label: "Pergudangan",
              },
              {
                value: "Perikanan Budidaya",
                symbol: getSymbolPolaRuangEnvelope([97, 145, 201]),
                label: "Perikanan Budidaya",
              },
              {
                value: "Perikanan Tangkap",
                symbol: getSymbolPolaRuangEnvelope([184, 252, 210]),
                label: "Perikanan Tangkap",
              },
              {
                value: "Perkantoran",
                symbol: getSymbolPolaRuangEnvelope([200, 20, 150]),
                label: "Perkantoran",
              },
              {
                value: "Perkebunan",
                symbol: getSymbolPolaRuangEnvelope([122, 183, 77]),
                label: "Perkebunan",
              },
              {
                value: "Perkebunan Rakyat",
                symbol: getSymbolPolaRuangEnvelope([179, 188, 252]),
                label: "Perkebunan Rakyat",
              },
              {
                value: "Pertahanan dan Keamanan",
                symbol: getSymbolPolaRuangEnvelope([115, 138, 69]),
                label: "Pertahanan dan Keamanan",
              },
              {
                value: "Pertambangan",
                symbol: getSymbolPolaRuangEnvelope([179, 188, 252]),
                label: "Pertambangan",
              },
              {
                value: "Perumahan dan Perdagangan/Jasa",
                symbol: getSymbolPolaRuangEnvelope([230, 152, 0]),
                label: "Perumahan dan Perdagangan/Jasa",
              },
              {
                value: "Perumahan dan Perkantoran",
                symbol: getSymbolPolaRuangEnvelope([179, 188, 252]),
                label: "Perumahan dan Perkantoran",
              },
              {
                value: "Perumahan, Perdagangan/Jasa dan Perkantoran",
                symbol: getSymbolPolaRuangEnvelope([252, 230, 197]),
                label: "Perumahan, Perdagangan/Jasa dan Perkantoran",
              },
              {
                value: "Peternakan",
                symbol: getSymbolPolaRuangEnvelope([252, 230, 197]),
                label: "Peternakan",
              },
              {
                value: "Pos Lintas Batas Negara",
                symbol: getSymbolPolaRuangEnvelope([252, 230, 197]),
                label: "Pos Lintas Batas Negara",
              },
              {
                value: "Resapan Air",
                symbol: getSymbolPolaRuangEnvelope([232, 255, 224]),
                label: "Resapan Air",
              },
              {
                value: "Rimba Kota",
                symbol: getSymbolPolaRuangEnvelope([219, 255, 214]),
                label: "Rimba Kota",
              },
              {
                value: "Ruang Terbuka Non Hijau",
                symbol: getSymbolPolaRuangEnvelope([238, 215, 252]),
                label: "Ruang Terbuka Non Hijau",
              },
              {
                value: "Rumah Kepadatan Rendah",
                symbol: getSymbolPolaRuangEnvelope([255, 255, 191]),
                label: "Rumah Kepadatan Rendah",
              },
              {
                value: "Rumah Kepadatan Sangat Rendah",
                symbol: getSymbolPolaRuangEnvelope([238, 215, 252]),
                label: "Rumah Kepadatan Sangat Rendah",
              },
              {
                value: "Rumah Kepadatan Sangat Tinggi",
                symbol: getSymbolPolaRuangEnvelope([255, 255, 77]),
                label: "Rumah Kepadatan Sangat Tinggi",
              },
              {
                value: "Rumah Kepadatan Sedang",
                symbol: getSymbolPolaRuangEnvelope([255, 255, 153]),
                label: "Rumah Kepadatan Sedang",
              },
              {
                value: "Rumah Kepadatan Tinggi",
                symbol: getSymbolPolaRuangEnvelope([255, 255, 115]),
                label: "Rumah Kepadatan Tinggi",
              },
              {
                value: "SPU Pendidikan Skala Kecamatan",
                symbol: getSymbolPolaRuangEnvelope([230, 0, 169]),
                label: "SPU Pendidikan Skala Kecamatan",
              },
              {
                value: "Sekitar Danau Atau Waduk",
                symbol: getSymbolPolaRuangEnvelope([252, 215, 227]),
                label: "Sekitar Danau Atau Waduk",
              },
              {
                value: "Sekitar Mata Air",
                symbol: getSymbolPolaRuangEnvelope([168, 255, 191]),
                label: "Sekitar Mata Air",
              },
              {
                value: "Sektor Informal",
                symbol: getSymbolPolaRuangEnvelope([255, 102, 0]),
                label: "Sektor Informal",
              },
              {
                value: "Sempadan Pantai",
                symbol: getSymbolPolaRuangEnvelope([204, 255, 204]),
                label: "Sempadan Pantai",
              },
              {
                value: "Sempadan Patahan Aktif",
                symbol: getSymbolPolaRuangEnvelope([252, 215, 227]),
                label: "Sempadan Patahan Aktif",
              },
              {
                value: "Sentra Industri Kecil dan Menengah",
                symbol: getSymbolPolaRuangEnvelope([252, 215, 227]),
                label: "Sentra Industri Kecil dan Menengah",
              },
              {
                value: "Suaka Margasatwa",
                symbol: getSymbolPolaRuangEnvelope([201, 252, 182]),
                label: "Suaka Margasatwa",
              },
              {
                value: "Taman Buru",
                symbol: getSymbolPolaRuangEnvelope([201, 252, 182]),
                label: "Taman Buru",
              },
              {
                value: "Taman Hutan Raya",
                symbol: getSymbolPolaRuangEnvelope([194, 212, 252]),
                label: "Taman Hutan Raya",
              },
              {
                value: "Taman Kecamatan",
                symbol: getSymbolPolaRuangEnvelope([141, 255, 7]),
                label: "Taman Kecamatan",
              },
              {
                value: "Taman Kelurahan",
                symbol: getSymbolPolaRuangEnvelope([166, 255, 61]),
                label: "Taman Kelurahan",
              },
              {
                value: "Taman Kota",
                symbol: getSymbolPolaRuangEnvelope([166, 255, 61]),
                label: "Taman Kota",
              },
              {
                value: "Taman Nasional",
                symbol: getSymbolPolaRuangEnvelope([194, 212, 252]),
                label: "Taman Nasional",
              },
              {
                value: "Taman RT",
                symbol: getSymbolPolaRuangEnvelope([194, 212, 252]),
                label: "Taman RT",
              },
              {
                value: "Taman RW",
                symbol: getSymbolPolaRuangEnvelope([153, 255, 50]),
                label: "Taman RW",
              },
              {
                value: "Taman Wisata Alam",
                symbol: getSymbolPolaRuangEnvelope([228, 192, 252]),
                label: "Taman Wisata Alam",
              },
              {
                value: "Tanaman Pangan",
                symbol: getSymbolPolaRuangEnvelope([228, 192, 252]),
                label: "Tanaman Pangan",
              },
              {
                value: "Tempat Evakuasi Akhir",
                symbol: getSymbolPolaRuangEnvelope([228, 192, 252]),
                label: "Tempat Evakuasi Akhir",
              },
              {
                value: "Tempat Evakuasi Sementara",
                symbol: getSymbolPolaRuangEnvelope([212, 252, 231]),
                label: "Tempat Evakuasi Sementara",
              },
              {
                value: "Tempat Pemrosesan Akhir",
                symbol: getSymbolPolaRuangEnvelope([230, 230, 0]),
                label: "Tempat Pemrosesan Akhir",
              },
              {
                value: "Transportasi",
                symbol: getSymbolPolaRuangEnvelope([255, 40, 50]),
                label: "Transportasi",
              },
              {
                value: "Wisata Alam",
                symbol: getSymbolPolaRuangEnvelope([255, 230, 255]),
                label: "Wisata Alam",
              },
              {
                value: "Wisata Buatan",
                symbol: getSymbolPolaRuangEnvelope([255, 230, 255]),
                label: "Wisata Buatan",
              },
              {
                value: "Wisata Budaya",
                symbol: getSymbolPolaRuangEnvelope([212, 252, 231]),
                label: "Wisata Budaya",
              },
              {
                value: "Zona Penyangga",
                symbol: getSymbolPolaRuangEnvelope([138, 255, 204]),
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
            url: config.url.ARCGIS_URL + "/Zonasi_Envelope/FeatureServer/0",
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
                      fieldName: "namazona",
                      label: "namazona",
                    },
                    {
                      fieldName: "kdzona ",
                      label: "kdzona ",
                    },
                    {
                      fieldName: "namaszona",
                      label: "namaszona",
                    },
                    {
                      fieldName: "kdszona",
                      label: "kdszona",
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
                    {
                      fieldName: "namazona_sebelum",
                      label: "namazona_sebelum",
                    },
                    {
                      fieldName: "kdzona_sebelum",
                      label: "kdzona_sebelum",
                    },
                    {
                      fieldName: "namaszona_sebelum",
                      label: "namaszona_sebelum",
                    },
                    {
                      fieldName: "kdszona_sebelum",
                      label: "kdszona_sebelum",
                    },
                    {
                      fieldName: "kdb_sebelum",
                      label: "kdb_sebelum",
                    },
                    {
                      fieldName: "klb_sebelum",
                      label: "klb_sebelum",
                    },
                    {
                      fieldName: "kdh_sebelum",
                      label: "kdh_sebelum",
                    },
                    {
                      fieldName: "gsb_sebelum",
                      label: "gsb_sebelum",
                    },
                    {
                      fieldName: "ktb_sebelum",
                      label: "ktb_sebelum",
                    },
                    {
                      fieldName: "lantai_max_sebelum",
                      label: "lantai_max_sebelum",
                    },
                    {
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
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
                    {
                      fieldName: "namazona_sebelum",
                      label: "namazona_sebelum",
                    },
                    {
                      fieldName: "kdzona_sebelum",
                      label: "kdzona_sebelum",
                    },
                    {
                      fieldName: "namaszona_sebelum",
                      label: "namaszona_sebelum",
                    },
                    {
                      fieldName: "kdszona_sebelum",
                      label: "kdszona_sebelum",
                    },
                    {
                      fieldName: "kdb_sebelum",
                      label: "kdb_sebelum",
                    },
                    {
                      fieldName: "klb_sebelum",
                      label: "klb_sebelum",
                    },
                    {
                      fieldName: "kdh_sebelum",
                      label: "kdh_sebelum",
                    },
                    {
                      fieldName: "gsb_sebelum",
                      label: "gsb_sebelum",
                    },
                    {
                      fieldName: "ktb_sebelum",
                      label: "ktb_sebelum",
                    },
                    {
                      fieldName: "lantai_max_sebelum",
                      label: "lantai_max_sebelum",
                    },
                    {
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
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
                    {
                      fieldName: "namazona_sebelum",
                      label: "namazona_sebelum",
                    },
                    {
                      fieldName: "kdzona_sebelum",
                      label: "kdzona_sebelum",
                    },
                    {
                      fieldName: "namaszona_sebelum",
                      label: "namaszona_sebelum",
                    },
                    {
                      fieldName: "kdszona_sebelum",
                      label: "kdszona_sebelum",
                    },
                    {
                      fieldName: "kdb_sebelum",
                      label: "kdb_sebelum",
                    },
                    {
                      fieldName: "klb_sebelum",
                      label: "klb_sebelum",
                    },
                    {
                      fieldName: "kdh_sebelum",
                      label: "kdh_sebelum",
                    },
                    {
                      fieldName: "gsb_sebelum",
                      label: "gsb_sebelum",
                    },
                    {
                      fieldName: "ktb_sebelum",
                      label: "ktb_sebelum",
                    },
                    {
                      fieldName: "lantai_max_sebelum",
                      label: "lantai_max_sebelum",
                    },
                    {
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
            editingEnabled: false,
          });

          const kemacetanJaringanJalanLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Kemacetan/kemacetan_jaringan_jalan/FeatureServer/0",
            title: "Jaringan Jalan",
            popupTemplate: {
              title: "Jaringan Jalan",
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
                      fieldName: "lebar",
                      label: "lebar",
                    },
                    {
                      fieldName: "los",
                      label: "los",
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
                      fieldName: "x1",
                      label: "x1",
                    },
                    {
                      fieldName: "x2",
                      label: "x2",
                    },
                    {
                      fieldName: "y1",
                      label: "y1",
                    },
                    {
                      fieldName: "y2",
                      label: "y2",
                    },
                  ],
                },
              ],
            },
            outFields: ["namobj", "kapasitas"],
            editingEnabled: false,
          });

          const airBersihPdamLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Air/airbersih_pdam/FeatureServer/0",
            title: "PDAM",
            popupTemplate: {
              title: "PDAM",
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
                      fieldName: "objectid",
                      label: "objectid",
                    },
                    {
                      fieldName: "id_polaruang",
                      label: "id_polaruang",
                    },
                    {
                      fieldName: "namazona",
                      label: "namazona",
                    },
                    {
                      fieldName: "kdzona",
                      label: "kdzona",
                    },
                    {
                      fieldName: "namaszona",
                      label: "namaszona",
                    },
                    {
                      fieldName: "kdszona",
                      label: "kdszona",
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
                      fieldName: "kdb_sebelum",
                      label: "kdb_sebelum",
                    },
                    {
                      fieldName: "klb",
                      label: "klb",
                    },
                    {
                      fieldName: "klb_sebelum",
                      label: "klb_sebelum",
                    },
                    {
                      fieldName: "kdh",
                      label: "kdh",
                    },
                    {
                      fieldName: "kdh_sebelum",
                      label: "kdh_sebelum",
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
                      fieldName: "status_pemb_optimum_sebelum",
                      label: "status_pemb_optimum_sebelum",
                    },
                    {
                      fieldName: "izin_air",
                      label: "izin_air",
                    },
                    {
                      fieldName: "izin_air_sebelum",
                      label: "izin_air_sebelum",
                    },
                    {
                      fieldName: "izin_macet",
                      label: "izin_macet",
                    },
                    {
                      fieldName: "izin_macet_sebelum",
                      label: "izin_macet_sebelum",
                    },
                    {
                      fieldName: "kabkot",
                      label: "kabkot",
                    },
                  ],
                },
              ],
            },
            outFields: ["id_polaruang", "namazona"],
          });

          const basemapPolaRuangLayer = new VectorTileLayer({
            url: config.url.ARCGIS_URL + "/Hosted/KDBKLB_PolaRuang_base/VectorTileServer",
            title: "Basemap Pola Ruang",
          });

          let kdbKlbGroupLayer = new GroupLayer({
            title: "Pembangunan Optimum",
            layers: [polaRuangKdbKlbLayer, persilTanahKdbKlbLayer, buildingsKdbKlbLayer],
          });
          let kemacetanGroupLayer = new GroupLayer({
            title: "Transportasi",
            layers: [kemacetanJaringanJalanLayer, polaRuangKemacetanLayer, persilTanahKemacetanLayer, buildingsKemacetanLayer],
          });
          let airBersihGroupLayer = new GroupLayer({
            title: "Air Bersih",
            layers: [airBersihPdamLayer, polaRuangAirBersihLayer, persilTanahAirBersihLayer, buildingsAirBersihLayer],
          });

          map.addMany([
            basemapPolaRuangLayer,
            polaRuangVersioningLayer,
            polaRuangEnvelopeLayer,
            persilTanahBpn,
            airBersihGroupLayer,
            kemacetanGroupLayer,
            kdbKlbGroupLayer,
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
          persilTanahBpn.visible = false;
          persilTanahKemacetanLayer.visible = false;
          persilTanahAirBersihLayer.visible = false;
          persilTanahKdbKlbLayer.visible = false;
          buildingsKemacetanLayer.visible = false;
          buildingsAirBersihLayer.visible = false;
          buildingsKdbKlbLayer.visible = false;

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
            var uniqueParentItems = [];
            const layerList = new LayerList({
              container: document.createElement("div"),
              view: view,
              listItemCreatedFunction: function (event) {
                var item = event.item;
                if (item.title === "Bangunan - Envelope") {
                  item.actionsSections = [
                    [
                      {
                        title: "Increase Transparency",
                        className: "esri-icon-up",
                        id: "decrease-opacity-bangunan-envelope",
                      },
                      {
                        title: "Decrease Transparency",
                        className: "esri-icon-down",
                        id: "increase-opacity-bangunan-envelope",
                      },
                    ],
                  ];
                } else if (item.title === "Zonasi - Envelope") {
                  item.actionsSections = [
                    [
                      {
                        title: "Increase Transparency",
                        className: "esri-icon-up",
                        id: "decrease-opacity-zonasi-envelope",
                      },
                      {
                        title: "Decrease Transparency",
                        className: "esri-icon-down",
                        id: "increase-opacity-zonasi-envelope",
                      },
                    ],
                  ];
                }
                if (!item.parent) {
                  if (!uniqueParentItems.includes(item.title)) {
                    uniqueParentItems.push(item.title);
                    item.watch("visible", function (event) {
                      if (event === false) {
                        view.popup.close();
                        setShowingPopop({ ...showingPopup, show: false, title: "" });
                      }
                    });
                  }
                }
              },
            });
            const layerListExpand = new Expand({
              expandIconClass: "esri-icon-layers",
              expandTooltip: "Daftar Layer",
              view: view,
              content: layerList.domNode,
            });
            layerList.on("trigger-action", function (event) {
              // Capture the action id.
              var id = event.action.id;
              if (id === "increase-opacity-bangunan-envelope") {
                // if the increase-opacity action is triggered, then
                // increase the opacity of the GroupLayer by 0.25
                if (buildingsEnvelopeLayer.opacity < 1) {
                  buildingsEnvelopeLayer.opacity += 0.25;
                }
              } else if (id === "decrease-opacity-bangunan-envelope") {
                // if the decrease-opacity action is triggered, then
                // decrease the opacity of the GroupLayer by 0.25
                if (buildingsEnvelopeLayer.opacity > 0) {
                  buildingsEnvelopeLayer.opacity -= 0.25;
                }
              } else if (id === "increase-opacity-zonasi-envelope") {
                // if the increase-opacity action is triggered, then
                // increase the opacity of the GroupLayer by 0.25
                if (polaRuangEnvelopeLayer.opacity < 1) {
                  polaRuangEnvelopeLayer.opacity += 0.25;
                }
              } else if (id === "decrease-opacity-zonasi-envelope") {
                // if the decrease-opacity action is triggered, then
                // decrease the opacity of the GroupLayer by 0.25
                if (polaRuangEnvelopeLayer.opacity > 0) {
                  polaRuangEnvelopeLayer.opacity -= 0.25;
                }
              }
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
                  layer: buildingsLayer,
                  enabled: true,
                  addEnabled: true,
                  updateEnabled: true,
                  deleteEnabled: true,
                  fieldConfig: [
                    {
                      name: "jenis",
                      label: "jenis",
                    },
                    {
                      name: "luas_m2",
                      label: "luas_m2",
                    },
                    {
                      name: "jlh_lantai",
                      label: "jlh_lantai",
                    },
                  ],
                },
                {
                  layer: polaRuangVersioningLayer,
                  enabled: true,
                  addEnabled: true,
                  updateEnabled: true,
                  deleteEnabled: true,
                  fieldConfig: [
                    {
                      name: "namazona",
                      label: "namazona",
                    },
                    {
                      name: "kdzona",
                      label: "kdzona",
                    },
                    {
                      name: "namaszona",
                      label: "namaszona",
                    },
                    {
                      name: "kdszona",
                      label: "kdszona",
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
              persilTanahBpn.popupEnabled = false;
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
                { layer: persilTanahBpn },
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
              let fieldsArr = [];
              features[0].layer.fields.map((fieldVal) => {
                if (features[0].attributes[fieldVal.name] !== undefined) {
                  fieldsArr.push({ field_name: fieldVal.name, field_value: features[0].attributes[fieldVal.name] });
                }
              });
              if (
                features[0].layer.title === "Bangunan - Pembangunan Optimum" ||
                features[0].layer.title === "Bangunan - Air Bersih" ||
                features[0].layer.title === "Bangunan - Transportasi"
              ) {
                setContentBangunanKdbKlb([
                  {
                    field_name: "jenis",
                    field_value: features[0].attributes.jenis,
                  },
                  {
                    field_name: "jenis_bang",
                    field_value: features[0].attributes.jenis_bang,
                  },
                  {
                    field_name: "status_kdbklb_sebelum",
                    field_value: features[0].attributes.status_kdbklb_sebelum,
                  },
                  {
                    field_name: "status_kdbklb",
                    field_value: features[0].attributes.status_kdbklb,
                  },
                  {
                    field_name: "melampaui_fa_sebelum",
                    field_value: features[0].attributes.melampaui_fa_sebelum,
                  },
                  {
                    field_name: "melampaui_fa",
                    field_value: features[0].attributes.melampaui_fa,
                  },
                  {
                    field_name: "melampaui_tinggi_sebelum",
                    field_value: features[0].attributes.melampaui_tinggi_sebelum,
                  },
                  {
                    field_name: "melampaui_tinggi",
                    field_value: features[0].attributes.melampaui_tinggi,
                  },
                  {
                    field_name: "izin_air_y5_sebelum",
                    field_value: features[0].attributes.izin_air_y5_sebelum,
                  },
                  {
                    field_name: "izin_air_y5",
                    field_value: features[0].attributes.izin_air_y5,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet",
                    field_value: features[0].attributes.izin_macet,
                  },
                  {
                    field_name: "los_num_sebelum",
                    field_value: features[0].attributes.los_num_sebelum,
                  },
                  {
                    field_name: "los_num",
                    field_value: features[0].attributes.los_num,
                  },
                  {
                    field_name: "los_sebelum",
                    field_value: features[0].attributes.los_sebelum,
                  },
                  {
                    field_name: "los",
                    field_value: features[0].attributes.los,
                  },
                  {
                    field_name: "jlh_lantai_sebelum",
                    field_value: features[0].attributes.jlh_lantai_sebelum,
                  },
                  {
                    field_name: "jlh_lantai",
                    field_value: features[0].attributes.jlh_lantai,
                  },
                  {
                    field_name: "luas_m2_sebelum",
                    field_value: features[0].attributes.luas_m2_sebelum,
                  },
                  {
                    field_name: "luas_m2",
                    field_value: features[0].attributes.luas_m2,
                  },
                  {
                    field_name: "fa_sebelum",
                    field_value: features[0].attributes.fa_sebelum,
                  },
                  {
                    field_name: "fa",
                    field_value: features[0].attributes.fa,
                  },
                  {
                    field_name: "id_bangunan",
                    field_value: features[0].attributes.id_bangunan,
                  },
                  {
                    field_name: "penduduk_y1",
                    field_value: features[0].attributes.penduduk_y1,
                  },
                  {
                    field_name: "penduduk_y2",
                    field_value: features[0].attributes.penduduk_y2,
                  },
                  {
                    field_name: "penduduk_y3",
                    field_value: features[0].attributes.penduduk_y3,
                  },
                  {
                    field_name: "penduduk_y4",
                    field_value: features[0].attributes.penduduk_y4,
                  },
                  {
                    field_name: "penduduk_y5",
                    field_value: features[0].attributes.penduduk_y5,
                  },
                  {
                    field_name: "laju_ptbh_penduduk",
                    field_value: features[0].attributes.laju_ptbh_penduduk,
                  },
                  {
                    field_name: "pertambahan_penduduk",
                    field_value: features[0].attributes.pertambahan_penduduk,
                  },
                  {
                    field_name: "penduduk_y5_pertambahan",
                    field_value: features[0].attributes.penduduk_y5_pertambahan,
                  },
                  {
                    field_name: "penduduk_y6_proyeksi",
                    field_value: features[0].attributes.penduduk_y6_proyeksi,
                  },
                  {
                    field_name: "penduduk_y7_proyeksi",
                    field_value: features[0].attributes.penduduk_y7_proyeksi,
                  },
                  {
                    field_name: "penduduk_y8_proyeksi",
                    field_value: features[0].attributes.penduduk_y8_proyeksi,
                  },
                  {
                    field_name: "penduduk_y9_proyeksi",
                    field_value: features[0].attributes.penduduk_y9_proyeksi,
                  },
                  {
                    field_name: "penduduk_y10_proyeksi",
                    field_value: features[0].attributes.penduduk_y10_proyeksi,
                  },
                  {
                    field_name: "pdam_kapasitas_harian",
                    field_value: features[0].attributes.pdam_kapasitas_harian,
                  },
                  {
                    field_name: "keb_air_harian_y5",
                    field_value: features[0].attributes.keb_air_harian_y5,
                  },
                  {
                    field_name: "keb_air_harian_y6",
                    field_value: features[0].attributes.keb_air_harian_y6,
                  },
                  {
                    field_name: "keb_air_harian_y7",
                    field_value: features[0].attributes.keb_air_harian_y7,
                  },
                  {
                    field_name: "keb_air_harian_y8",
                    field_value: features[0].attributes.keb_air_harian_y8,
                  },
                  {
                    field_name: "keb_air_harian_y9",
                    field_value: features[0].attributes.keb_air_harian_y9,
                  },
                  {
                    field_name: "keb_air_harian_y10",
                    field_value: features[0].attributes.keb_air_harian_y10,
                  },
                  {
                    field_name: "izin_air_y6",
                    field_value: features[0].attributes.izin_air_y6,
                  },
                  {
                    field_name: "izin_air_y7",
                    field_value: features[0].attributes.izin_air_y7,
                  },
                  {
                    field_name: "izin_air_y8",
                    field_value: features[0].attributes.izin_air_y8,
                  },
                  {
                    field_name: "izin_air_y9",
                    field_value: features[0].attributes.izin_air_y9,
                  },
                  {
                    field_name: "izin_air_y10",
                    field_value: features[0].attributes.izin_air_y10,
                  },
                  {
                    field_name: "lebar_jalan",
                    field_value: features[0].attributes.lebar_jalan,
                  },
                  {
                    field_name: "panjang_jalan",
                    field_value: features[0].attributes.panjang_jalan,
                  },
                  {
                    field_name: "bangkitan",
                    field_value: features[0].attributes.bangkitan,
                  },
                  {
                    field_name: "bangkitan_ruasjalan",
                    field_value: features[0].attributes.bangkitan_ruasjalan,
                  },
                  {
                    field_name: "kapasitas",
                    field_value: features[0].attributes.kapasitas,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y6",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y6,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y7",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y7,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y8",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y8,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y9",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y9,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y10",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y10,
                  },
                  {
                    field_name: "izin_macet_y6",
                    field_value: features[0].attributes.izin_macet_y6,
                  },
                  {
                    field_name: "izin_macet_y7",
                    field_value: features[0].attributes.izin_macet_y7,
                  },
                  {
                    field_name: "izin_macet_y8",
                    field_value: features[0].attributes.izin_macet_y8,
                  },
                  {
                    field_name: "izin_macet_y9",
                    field_value: features[0].attributes.izin_macet_y9,
                  },
                  {
                    field_name: "izin_macet_y10",
                    field_value: features[0].attributes.izin_macet_y10,
                  },
                  {
                    field_name: "izin_air_y6_sebelum",
                    field_value: features[0].attributes.izin_air_y6_sebelum,
                  },
                  {
                    field_name: "izin_air_y7_sebelum",
                    field_value: features[0].attributes.izin_air_y7_sebelum,
                  },
                  {
                    field_name: "izin_air_y8_sebelum",
                    field_value: features[0].attributes.izin_air_y8_sebelum,
                  },
                  {
                    field_name: "izin_air_y9_sebelum",
                    field_value: features[0].attributes.izin_air_y9_sebelum,
                  },
                  {
                    field_name: "izin_air_y10_sebelum",
                    field_value: features[0].attributes.izin_air_y10_sebelum,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet_y6_sebelum",
                    field_value: features[0].attributes.izin_macet_y6_sebelum,
                  },
                  {
                    field_name: "izin_macet_y7_sebelum",
                    field_value: features[0].attributes.izin_macet_y7_sebelum,
                  },
                  {
                    field_name: "izin_macet_y8_sebelum",
                    field_value: features[0].attributes.izin_macet_y8_sebelum,
                  },
                  {
                    field_name: "izin_macet_y9_sebelum",
                    field_value: features[0].attributes.izin_macet_y9_sebelum,
                  },
                  {
                    field_name: "izin_macet_y10_sebelum",
                    field_value: features[0].attributes.izin_macet_y10_sebelum,
                  },
                  {
                    field_name: "sumber",
                    field_value: features[0].attributes.sumber,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                ]);
                setHasilSimulasiBangunanKdbKlb(features[0].attributes.melampaui_tinggi);
                if (features[0].attributes.melampaui_tinggi === "Belum melampaui jumlah lantai maksimal") {
                  setHasilWarnaBangunanKdbKlb("#4CE600");
                } else if (features[0].attributes.melampaui_tinggi === "Melampaui jumlah lantai maksimal") {
                  setHasilWarnaBangunanKdbKlb("#FF0000");
                } else if (features[0].attributes.melampaui_tinggi === "Jumlah lantai sudah maksimal") {
                  setHasilWarnaBangunanKdbKlb("#FFFF00");
                } else {
                  setHasilWarnaBangunanKdbKlb("#B2B2B2");
                  setHasilSimulasiBangunanKdbKlb("Eksisting");
                }

                setContentBangunanKemacetan([
                  {
                    field_name: "jenis",
                    field_value: features[0].attributes.jenis,
                  },
                  {
                    field_name: "jenis_bang",
                    field_value: features[0].attributes.jenis_bang,
                  },
                  {
                    field_name: "status_kdbklb_sebelum",
                    field_value: features[0].attributes.status_kdbklb_sebelum,
                  },
                  {
                    field_name: "status_kdbklb",
                    field_value: features[0].attributes.status_kdbklb,
                  },
                  {
                    field_name: "melampaui_fa_sebelum",
                    field_value: features[0].attributes.melampaui_fa_sebelum,
                  },
                  {
                    field_name: "melampaui_fa",
                    field_value: features[0].attributes.melampaui_fa,
                  },
                  {
                    field_name: "melampaui_tinggi_sebelum",
                    field_value: features[0].attributes.melampaui_tinggi_sebelum,
                  },
                  {
                    field_name: "melampaui_tinggi",
                    field_value: features[0].attributes.melampaui_tinggi,
                  },
                  {
                    field_name: "izin_air_y5_sebelum",
                    field_value: features[0].attributes.izin_air_y5_sebelum,
                  },
                  {
                    field_name: "izin_air_y5",
                    field_value: features[0].attributes.izin_air_y5,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet",
                    field_value: features[0].attributes.izin_macet,
                  },
                  {
                    field_name: "los_num_sebelum",
                    field_value: features[0].attributes.los_num_sebelum,
                  },
                  {
                    field_name: "los_num",
                    field_value: features[0].attributes.los_num,
                  },
                  {
                    field_name: "los_sebelum",
                    field_value: features[0].attributes.los_sebelum,
                  },
                  {
                    field_name: "los",
                    field_value: features[0].attributes.los,
                  },
                  {
                    field_name: "jlh_lantai_sebelum",
                    field_value: features[0].attributes.jlh_lantai_sebelum,
                  },
                  {
                    field_name: "jlh_lantai",
                    field_value: features[0].attributes.jlh_lantai,
                  },
                  {
                    field_name: "luas_m2_sebelum",
                    field_value: features[0].attributes.luas_m2_sebelum,
                  },
                  {
                    field_name: "luas_m2",
                    field_value: features[0].attributes.luas_m2,
                  },
                  {
                    field_name: "fa_sebelum",
                    field_value: features[0].attributes.fa_sebelum,
                  },
                  {
                    field_name: "fa",
                    field_value: features[0].attributes.fa,
                  },
                  {
                    field_name: "id_bangunan",
                    field_value: features[0].attributes.id_bangunan,
                  },
                  {
                    field_name: "penduduk_y1",
                    field_value: features[0].attributes.penduduk_y1,
                  },
                  {
                    field_name: "penduduk_y2",
                    field_value: features[0].attributes.penduduk_y2,
                  },
                  {
                    field_name: "penduduk_y3",
                    field_value: features[0].attributes.penduduk_y3,
                  },
                  {
                    field_name: "penduduk_y4",
                    field_value: features[0].attributes.penduduk_y4,
                  },
                  {
                    field_name: "penduduk_y5",
                    field_value: features[0].attributes.penduduk_y5,
                  },
                  {
                    field_name: "laju_ptbh_penduduk",
                    field_value: features[0].attributes.laju_ptbh_penduduk,
                  },
                  {
                    field_name: "pertambahan_penduduk",
                    field_value: features[0].attributes.pertambahan_penduduk,
                  },
                  {
                    field_name: "penduduk_y5_pertambahan",
                    field_value: features[0].attributes.penduduk_y5_pertambahan,
                  },
                  {
                    field_name: "penduduk_y6_proyeksi",
                    field_value: features[0].attributes.penduduk_y6_proyeksi,
                  },
                  {
                    field_name: "penduduk_y7_proyeksi",
                    field_value: features[0].attributes.penduduk_y7_proyeksi,
                  },
                  {
                    field_name: "penduduk_y8_proyeksi",
                    field_value: features[0].attributes.penduduk_y8_proyeksi,
                  },
                  {
                    field_name: "penduduk_y9_proyeksi",
                    field_value: features[0].attributes.penduduk_y9_proyeksi,
                  },
                  {
                    field_name: "penduduk_y10_proyeksi",
                    field_value: features[0].attributes.penduduk_y10_proyeksi,
                  },
                  {
                    field_name: "pdam_kapasitas_harian",
                    field_value: features[0].attributes.pdam_kapasitas_harian,
                  },
                  {
                    field_name: "keb_air_harian_y5",
                    field_value: features[0].attributes.keb_air_harian_y5,
                  },
                  {
                    field_name: "keb_air_harian_y6",
                    field_value: features[0].attributes.keb_air_harian_y6,
                  },
                  {
                    field_name: "keb_air_harian_y7",
                    field_value: features[0].attributes.keb_air_harian_y7,
                  },
                  {
                    field_name: "keb_air_harian_y8",
                    field_value: features[0].attributes.keb_air_harian_y8,
                  },
                  {
                    field_name: "keb_air_harian_y9",
                    field_value: features[0].attributes.keb_air_harian_y9,
                  },
                  {
                    field_name: "keb_air_harian_y10",
                    field_value: features[0].attributes.keb_air_harian_y10,
                  },
                  {
                    field_name: "izin_air_y6",
                    field_value: features[0].attributes.izin_air_y6,
                  },
                  {
                    field_name: "izin_air_y7",
                    field_value: features[0].attributes.izin_air_y7,
                  },
                  {
                    field_name: "izin_air_y8",
                    field_value: features[0].attributes.izin_air_y8,
                  },
                  {
                    field_name: "izin_air_y9",
                    field_value: features[0].attributes.izin_air_y9,
                  },
                  {
                    field_name: "izin_air_y10",
                    field_value: features[0].attributes.izin_air_y10,
                  },
                  {
                    field_name: "lebar_jalan",
                    field_value: features[0].attributes.lebar_jalan,
                  },
                  {
                    field_name: "panjang_jalan",
                    field_value: features[0].attributes.panjang_jalan,
                  },
                  {
                    field_name: "bangkitan",
                    field_value: features[0].attributes.bangkitan,
                  },
                  {
                    field_name: "bangkitan_ruasjalan",
                    field_value: features[0].attributes.bangkitan_ruasjalan,
                  },
                  {
                    field_name: "kapasitas",
                    field_value: features[0].attributes.kapasitas,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y6",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y6,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y7",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y7,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y8",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y8,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y9",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y9,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y10",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y10,
                  },
                  {
                    field_name: "izin_macet_y6",
                    field_value: features[0].attributes.izin_macet_y6,
                  },
                  {
                    field_name: "izin_macet_y7",
                    field_value: features[0].attributes.izin_macet_y7,
                  },
                  {
                    field_name: "izin_macet_y8",
                    field_value: features[0].attributes.izin_macet_y8,
                  },
                  {
                    field_name: "izin_macet_y9",
                    field_value: features[0].attributes.izin_macet_y9,
                  },
                  {
                    field_name: "izin_macet_y10",
                    field_value: features[0].attributes.izin_macet_y10,
                  },
                  {
                    field_name: "izin_air_y6_sebelum",
                    field_value: features[0].attributes.izin_air_y6_sebelum,
                  },
                  {
                    field_name: "izin_air_y7_sebelum",
                    field_value: features[0].attributes.izin_air_y7_sebelum,
                  },
                  {
                    field_name: "izin_air_y8_sebelum",
                    field_value: features[0].attributes.izin_air_y8_sebelum,
                  },
                  {
                    field_name: "izin_air_y9_sebelum",
                    field_value: features[0].attributes.izin_air_y9_sebelum,
                  },
                  {
                    field_name: "izin_air_y10_sebelum",
                    field_value: features[0].attributes.izin_air_y10_sebelum,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet_y6_sebelum",
                    field_value: features[0].attributes.izin_macet_y6_sebelum,
                  },
                  {
                    field_name: "izin_macet_y7_sebelum",
                    field_value: features[0].attributes.izin_macet_y7_sebelum,
                  },
                  {
                    field_name: "izin_macet_y8_sebelum",
                    field_value: features[0].attributes.izin_macet_y8_sebelum,
                  },
                  {
                    field_name: "izin_macet_y9_sebelum",
                    field_value: features[0].attributes.izin_macet_y9_sebelum,
                  },
                  {
                    field_name: "izin_macet_y10_sebelum",
                    field_value: features[0].attributes.izin_macet_y10_sebelum,
                  },
                  {
                    field_name: "sumber",
                    field_value: features[0].attributes.sumber,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                ]);
                setHasilSimulasiBangunanKemacetan(features[0].attributes.izin_macet);
                if (features[0].attributes.izin_macet === "Ditolak/rekomendasi") {
                  setHasilWarnaBangunanKemacetan("#A80000");
                } else if (features[0].attributes.izin_macet === "Diizinkan") {
                  setHasilWarnaBangunanKemacetan("#00A884");
                } else {
                  setHasilWarnaBangunanKemacetan("#B2B2B2");
                  setHasilSimulasiBangunanKemacetan("Eksisting");
                }

                setContentBangunanAirBersih([
                  {
                    field_name: "jenis",
                    field_value: features[0].attributes.jenis,
                  },
                  {
                    field_name: "jenis_bang",
                    field_value: features[0].attributes.jenis_bang,
                  },
                  {
                    field_name: "status_kdbklb_sebelum",
                    field_value: features[0].attributes.status_kdbklb_sebelum,
                  },
                  {
                    field_name: "status_kdbklb",
                    field_value: features[0].attributes.status_kdbklb,
                  },
                  {
                    field_name: "melampaui_fa_sebelum",
                    field_value: features[0].attributes.melampaui_fa_sebelum,
                  },
                  {
                    field_name: "melampaui_fa",
                    field_value: features[0].attributes.melampaui_fa,
                  },
                  {
                    field_name: "melampaui_tinggi_sebelum",
                    field_value: features[0].attributes.melampaui_tinggi_sebelum,
                  },
                  {
                    field_name: "melampaui_tinggi",
                    field_value: features[0].attributes.melampaui_tinggi,
                  },
                  {
                    field_name: "izin_air_y5_sebelum",
                    field_value: features[0].attributes.izin_air_y5_sebelum,
                  },
                  {
                    field_name: "izin_air_y5",
                    field_value: features[0].attributes.izin_air_y5,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet",
                    field_value: features[0].attributes.izin_macet,
                  },
                  {
                    field_name: "los_num_sebelum",
                    field_value: features[0].attributes.los_num_sebelum,
                  },
                  {
                    field_name: "los_num",
                    field_value: features[0].attributes.los_num,
                  },
                  {
                    field_name: "los_sebelum",
                    field_value: features[0].attributes.los_sebelum,
                  },
                  {
                    field_name: "los",
                    field_value: features[0].attributes.los,
                  },
                  {
                    field_name: "jlh_lantai_sebelum",
                    field_value: features[0].attributes.jlh_lantai_sebelum,
                  },
                  {
                    field_name: "jlh_lantai",
                    field_value: features[0].attributes.jlh_lantai,
                  },
                  {
                    field_name: "luas_m2_sebelum",
                    field_value: features[0].attributes.luas_m2_sebelum,
                  },
                  {
                    field_name: "luas_m2",
                    field_value: features[0].attributes.luas_m2,
                  },
                  {
                    field_name: "fa_sebelum",
                    field_value: features[0].attributes.fa_sebelum,
                  },
                  {
                    field_name: "fa",
                    field_value: features[0].attributes.fa,
                  },
                  {
                    field_name: "id_bangunan",
                    field_value: features[0].attributes.id_bangunan,
                  },
                  {
                    field_name: "penduduk_y1",
                    field_value: features[0].attributes.penduduk_y1,
                  },
                  {
                    field_name: "penduduk_y2",
                    field_value: features[0].attributes.penduduk_y2,
                  },
                  {
                    field_name: "penduduk_y3",
                    field_value: features[0].attributes.penduduk_y3,
                  },
                  {
                    field_name: "penduduk_y4",
                    field_value: features[0].attributes.penduduk_y4,
                  },
                  {
                    field_name: "penduduk_y5",
                    field_value: features[0].attributes.penduduk_y5,
                  },
                  {
                    field_name: "laju_ptbh_penduduk",
                    field_value: features[0].attributes.laju_ptbh_penduduk,
                  },
                  {
                    field_name: "pertambahan_penduduk",
                    field_value: features[0].attributes.pertambahan_penduduk,
                  },
                  {
                    field_name: "penduduk_y5_pertambahan",
                    field_value: features[0].attributes.penduduk_y5_pertambahan,
                  },
                  {
                    field_name: "penduduk_y6_proyeksi",
                    field_value: features[0].attributes.penduduk_y6_proyeksi,
                  },
                  {
                    field_name: "penduduk_y7_proyeksi",
                    field_value: features[0].attributes.penduduk_y7_proyeksi,
                  },
                  {
                    field_name: "penduduk_y8_proyeksi",
                    field_value: features[0].attributes.penduduk_y8_proyeksi,
                  },
                  {
                    field_name: "penduduk_y9_proyeksi",
                    field_value: features[0].attributes.penduduk_y9_proyeksi,
                  },
                  {
                    field_name: "penduduk_y10_proyeksi",
                    field_value: features[0].attributes.penduduk_y10_proyeksi,
                  },
                  {
                    field_name: "pdam_kapasitas_harian",
                    field_value: features[0].attributes.pdam_kapasitas_harian,
                  },
                  {
                    field_name: "keb_air_harian_y5",
                    field_value: features[0].attributes.keb_air_harian_y5,
                  },
                  {
                    field_name: "keb_air_harian_y6",
                    field_value: features[0].attributes.keb_air_harian_y6,
                  },
                  {
                    field_name: "keb_air_harian_y7",
                    field_value: features[0].attributes.keb_air_harian_y7,
                  },
                  {
                    field_name: "keb_air_harian_y8",
                    field_value: features[0].attributes.keb_air_harian_y8,
                  },
                  {
                    field_name: "keb_air_harian_y9",
                    field_value: features[0].attributes.keb_air_harian_y9,
                  },
                  {
                    field_name: "keb_air_harian_y10",
                    field_value: features[0].attributes.keb_air_harian_y10,
                  },
                  {
                    field_name: "izin_air_y6",
                    field_value: features[0].attributes.izin_air_y6,
                  },
                  {
                    field_name: "izin_air_y7",
                    field_value: features[0].attributes.izin_air_y7,
                  },
                  {
                    field_name: "izin_air_y8",
                    field_value: features[0].attributes.izin_air_y8,
                  },
                  {
                    field_name: "izin_air_y9",
                    field_value: features[0].attributes.izin_air_y9,
                  },
                  {
                    field_name: "izin_air_y10",
                    field_value: features[0].attributes.izin_air_y10,
                  },
                  {
                    field_name: "lebar_jalan",
                    field_value: features[0].attributes.lebar_jalan,
                  },
                  {
                    field_name: "panjang_jalan",
                    field_value: features[0].attributes.panjang_jalan,
                  },
                  {
                    field_name: "bangkitan",
                    field_value: features[0].attributes.bangkitan,
                  },
                  {
                    field_name: "bangkitan_ruasjalan",
                    field_value: features[0].attributes.bangkitan_ruasjalan,
                  },
                  {
                    field_name: "kapasitas",
                    field_value: features[0].attributes.kapasitas,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y6",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y6,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y7",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y7,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y8",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y8,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y9",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y9,
                  },
                  {
                    field_name: "bangkitan_ruasjalan_y10",
                    field_value: features[0].attributes.bangkitan_ruasjalan_y10,
                  },
                  {
                    field_name: "izin_macet_y6",
                    field_value: features[0].attributes.izin_macet_y6,
                  },
                  {
                    field_name: "izin_macet_y7",
                    field_value: features[0].attributes.izin_macet_y7,
                  },
                  {
                    field_name: "izin_macet_y8",
                    field_value: features[0].attributes.izin_macet_y8,
                  },
                  {
                    field_name: "izin_macet_y9",
                    field_value: features[0].attributes.izin_macet_y9,
                  },
                  {
                    field_name: "izin_macet_y10",
                    field_value: features[0].attributes.izin_macet_y10,
                  },
                  {
                    field_name: "izin_air_y6_sebelum",
                    field_value: features[0].attributes.izin_air_y6_sebelum,
                  },
                  {
                    field_name: "izin_air_y7_sebelum",
                    field_value: features[0].attributes.izin_air_y7_sebelum,
                  },
                  {
                    field_name: "izin_air_y8_sebelum",
                    field_value: features[0].attributes.izin_air_y8_sebelum,
                  },
                  {
                    field_name: "izin_air_y9_sebelum",
                    field_value: features[0].attributes.izin_air_y9_sebelum,
                  },
                  {
                    field_name: "izin_air_y10_sebelum",
                    field_value: features[0].attributes.izin_air_y10_sebelum,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet_y6_sebelum",
                    field_value: features[0].attributes.izin_macet_y6_sebelum,
                  },
                  {
                    field_name: "izin_macet_y7_sebelum",
                    field_value: features[0].attributes.izin_macet_y7_sebelum,
                  },
                  {
                    field_name: "izin_macet_y8_sebelum",
                    field_value: features[0].attributes.izin_macet_y8_sebelum,
                  },
                  {
                    field_name: "izin_macet_y9_sebelum",
                    field_value: features[0].attributes.izin_macet_y9_sebelum,
                  },
                  {
                    field_name: "izin_macet_y10_sebelum",
                    field_value: features[0].attributes.izin_macet_y10_sebelum,
                  },
                  {
                    field_name: "sumber",
                    field_value: features[0].attributes.sumber,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                ]);
                setHasilSimulasiBangunanAirBersih(features[0].attributes.izin_air_y5);
                if (features[0].attributes.izin_air_y5 === "Ditolak/rekomendasi") {
                  setHasilWarnaBangunanAirBersih("#730000");
                } else if (features[0].attributes.izin_air_y5 === "Diizinkan") {
                  setHasilWarnaBangunanAirBersih("#00A884");
                } else {
                  setHasilWarnaBangunanAirBersih("#B2B2B2");
                  setHasilSimulasiBangunanAirBersih("Eksisting");
                }

                // get persil tanah
                Axios.get(
                  config.url.ARCGIS_URL +
                    "/KDBKLB/KDBKLB_PersilTanah_Pabaton/FeatureServer/0/query?where=objectid+%3D+" +
                    features[0].attributes.oid_persil_tanah +
                    "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=pjson"
                )
                  .then(function (response) {
                    // handle success
                    if (response.data.features.length > 0) {
                      var features = response.data.features[0].attributes;
                      setContentHasilPersilTanahKdbKlb({
                        field_name: "status_pemb_optimum",
                        field_value: features.status_pemb_optimum,
                      });
                      setContentHasilPersilTanahKemacetan({
                        field_name: "izin_macet",
                        field_value: features.izin_macet,
                      });
                      setContentHasilPersilTanahAirBersih({
                        field_name: "izin_air",
                        field_value: features.izin_air,
                      });
                      setContentPersilTanah([
                        {
                          field_name: "objectid",
                          field_value: features.objectid,
                        },
                        {
                          field_name: "namzon",
                          field_value: features.namzon,
                        },
                        {
                          field_name: "wadmkc",
                          field_value: features.wadmkc,
                        },
                        {
                          field_name: "wadmkd",
                          field_value: features.wadmkd,
                        },
                        {
                          field_name: "luas_m2",
                          field_value: features.luas_m2,
                        },
                        {
                          field_name: "luaspeta",
                          field_value: features.luaspeta,
                        },
                        {
                          field_name: "luasha",
                          field_value: features.luasha,
                        },
                        {
                          field_name: "kdb",
                          field_value: features.kdb,
                        },
                        {
                          field_name: "klb",
                          field_value: features.klb,
                        },
                        {
                          field_name: "kdh",
                          field_value: features.kdh,
                        },
                        {
                          field_name: "lantai_max",
                          field_value: features.lantai_max,
                        },
                        {
                          field_name: "nib",
                          field_value: features.nib,
                        },
                        {
                          field_name: "status_pemb_optimum_sebelum",
                          field_value: features.status_pemb_optimum_sebelum,
                        },
                        {
                          field_name: "izin_air_sebelum",
                          field_value: features.izin_air_sebelum,
                        },
                        {
                          field_name: "izin_macet_sebelum",
                          field_value: features.izin_macet_sebelum,
                        },
                      ]);
                    }
                  })
                  .catch(function (error) {
                    // handle error
                    console.log("error check", error);
                  });

                // get pola ruang
                Axios.get(
                  config.url.ARCGIS_URL +
                    "/KDBKLB/KDBKLB_PolaRuang/FeatureServer/0/query?where=objectid+%3D+" +
                    features[0].attributes.oid_zonasi +
                    "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=pjson"
                )
                  .then(function (response) {
                    // handle success
                    if (response.data.features.length > 0) {
                      var features_pola_ruang = response.data.features[0].attributes;
                      setContentHasilPolaRuangKdbKlb({
                        field_name: "status_pemb_optimum",
                        field_value: features_pola_ruang.status_pemb_optimum,
                      });
                      setContentHasilPolaRuangKemacetan({
                        field_name: "izin_macet",
                        field_value: features_pola_ruang.izin_macet,
                      });
                      setContentHasilPolaRuangAirBersih({
                        field_name: "izin_air",
                        field_value: features_pola_ruang.izin_air,
                      });
                      setContentPolaRuang([
                        {
                          field_name: "objectid",
                          field_value: features_pola_ruang.objectid,
                        },
                        {
                          field_name: "namobj",
                          field_value: features_pola_ruang.namobj,
                        },
                        {
                          field_name: "namzon",
                          field_value: features_pola_ruang.namzon,
                        },
                        {
                          field_name: "kodzon",
                          field_value: features_pola_ruang.kodzon,
                        },
                        {
                          field_name: "namszn",
                          field_value: features_pola_ruang.namszn,
                        },
                        {
                          field_name: "kodszn",
                          field_value: features_pola_ruang.kodszn,
                        },
                        {
                          field_name: "nambwp",
                          field_value: features_pola_ruang.nambwp,
                        },
                        {
                          field_name: "nasbwp",
                          field_value: features_pola_ruang.nasbwp,
                        },
                        {
                          field_name: "kodblk",
                          field_value: features_pola_ruang.kodblk,
                        },
                        {
                          field_name: "kodsbl",
                          field_value: features_pola_ruang.kodsbl,
                        },
                        {
                          field_name: "wadmkc",
                          field_value: features_pola_ruang.wadmkc,
                        },
                        {
                          field_name: "wadmkd",
                          field_value: features_pola_ruang.wadmkd,
                        },
                        {
                          field_name: "kkop_1",
                          field_value: features_pola_ruang.kkop_1,
                        },
                        {
                          field_name: "lp2b_2",
                          field_value: features_pola_ruang.lp2b_2,
                        },
                        {
                          field_name: "krb_03",
                          field_value: features_pola_ruang.krb_03,
                        },
                        {
                          field_name: "tod_04",
                          field_value: features_pola_ruang.tod_04,
                        },
                        {
                          field_name: "teb_05",
                          field_value: features_pola_ruang.teb_05,
                        },
                        {
                          field_name: "cagbud",
                          field_value: features_pola_ruang.cagbud,
                        },
                        {
                          field_name: "hankam",
                          field_value: features_pola_ruang.hankam,
                        },
                        {
                          field_name: "puslit",
                          field_value: features_pola_ruang.puslit,
                        },
                        {
                          field_name: "tpz_00",
                          field_value: features_pola_ruang.tpz_00,
                        },
                        {
                          field_name: "luasha",
                          field_value: features_pola_ruang.luasha,
                        },
                        {
                          field_name: "kdb",
                          field_value: features_pola_ruang.kdb,
                        },
                        {
                          field_name: "klb",
                          field_value: features_pola_ruang.klb,
                        },
                        {
                          field_name: "kdh",
                          field_value: features_pola_ruang.kdh,
                        },
                        {
                          field_name: "lantai_max",
                          field_value: features_pola_ruang.lantai_max,
                        },
                        {
                          field_name: "id_polaruang",
                          field_value: features_pola_ruang.id_polaruang,
                        },
                        {
                          field_name: "gsb",
                          field_value: features_pola_ruang.gsb,
                        },
                        {
                          field_name: "ktb",
                          field_value: features_pola_ruang.ktb,
                        },
                        {
                          field_name: "keterangan",
                          field_value: features_pola_ruang.keterangan,
                        },
                        {
                          field_name: "kabkot",
                          field_value: features_pola_ruang.kabkot,
                        },
                        {
                          field_name: "userid",
                          field_value: features_pola_ruang.userid,
                        },
                        {
                          field_name: "namazona",
                          field_value: features_pola_ruang.namazona,
                        },
                        {
                          field_name: "kdzona",
                          field_value: features_pola_ruang.kdzona,
                        },
                        {
                          field_name: "namaszona",
                          field_value: features_pola_ruang.namaszona,
                        },
                        {
                          field_name: "kdszona",
                          field_value: features_pola_ruang.kdszona,
                        },
                        {
                          field_name: "namazona_sebelum",
                          field_value: features_pola_ruang.namazona_sebelum,
                        },
                        {
                          field_name: "kdzona_sebelum",
                          field_value: features_pola_ruang.kdzona_sebelum,
                        },
                        {
                          field_name: "namaszona_sebelum",
                          field_value: features_pola_ruang.namaszona_sebelum,
                        },
                        {
                          field_name: "kdszona_sebelum",
                          field_value: features_pola_ruang.kdszona_sebelum,
                        },
                        {
                          field_name: "kdb_sebelum",
                          field_value: features_pola_ruang.kdb_sebelum,
                        },
                        {
                          field_name: "klb_sebelum",
                          field_value: features_pola_ruang.klb_sebelum,
                        },
                        {
                          field_name: "kdh_sebelum",
                          field_value: features_pola_ruang.kdh_sebelum,
                        },
                        {
                          field_name: "gsb_sebelum",
                          field_value: features_pola_ruang.gsb_sebelum,
                        },
                        {
                          field_name: "ktb_sebelum",
                          field_value: features_pola_ruang.ktb_sebelum,
                        },
                        {
                          field_name: "lantai_max_sebelum",
                          field_value: features_pola_ruang.lantai_max_sebelum,
                        },
                        {
                          field_name: "status_pemb_optimum_sebelum",
                          field_value: features_pola_ruang.status_pemb_optimum_sebelum,
                        },
                        {
                          field_name: "izin_air_sebelum",
                          field_value: features_pola_ruang.izin_air_sebelum,
                        },
                        {
                          field_name: "izin_macet_sebelum",
                          field_value: features_pola_ruang.izin_macet_sebelum,
                        },
                      ]);
                    }
                  })
                  .catch(function (error) {
                    // handle error
                    console.log("error check", error);
                  });
              } else if (features[0].layer.title === "Pola Ruang Versioning") {
                setContentGeneral([
                  {
                    field_name: "namazona",
                    field_value: features[0].attributes.namazona,
                  },
                  {
                    field_name: "kdzona",
                    field_value: features[0].attributes.kdzona,
                  },
                  {
                    field_name: "namaszona",
                    field_value: features[0].attributes.namaszona,
                  },
                  {
                    field_name: "kdszona",
                    field_value: features[0].attributes.kdszona,
                  },
                  {
                    field_name: "status_pemb_optimum_sebelum",
                    field_value: features[0].attributes.status_pemb_optimum_sebelum,
                  },
                  {
                    field_name: "status_pemb_optimum",
                    field_value: features[0].attributes.status_pemb_optimum,
                  },
                  {
                    field_name: "izin_air_sebelum",
                    field_value: features[0].attributes.izin_air_sebelum,
                  },
                  {
                    field_name: "izin_air",
                    field_value: features[0].attributes.izin_air,
                  },
                  {
                    field_name: "izin_macet_sebelum",
                    field_value: features[0].attributes.izin_macet_sebelum,
                  },
                  {
                    field_name: "izin_macet",
                    field_value: features[0].attributes.izin_macet,
                  },
                  {
                    field_name: "kdb_sebelum",
                    field_value: features[0].attributes.kdb_sebelum,
                  },
                  {
                    field_name: "kdb",
                    field_value: features[0].attributes.kdb,
                  },
                  {
                    field_name: "klb_sebelum",
                    field_value: features[0].attributes.klb_sebelum,
                  },
                  {
                    field_name: "klb",
                    field_value: features[0].attributes.klb,
                  },
                  {
                    field_name: "kdh_sebelum",
                    field_value: features[0].attributes.kdh_sebelum,
                  },
                  {
                    field_name: "kdh",
                    field_value: features[0].attributes.kdh,
                  },
                  {
                    field_name: "lantai_max_sebelum",
                    field_value: features[0].attributes.lantai_max_sebelum,
                  },
                  {
                    field_name: "lantai_max",
                    field_value: features[0].attributes.lantai_max,
                  },
                  {
                    field_name: "id_polaruang",
                    field_value: features[0].attributes.id_polaruang,
                  },
                  {
                    field_name: "luasha",
                    field_value: features[0].attributes.luasha,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                ]);
              } else {
                setContentGeneral(fieldsArr);
              }
              setShowingPopop({
                ...showingPopup,
                show: !showingPopup.show,
                title: features[0].layer.title,
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
    setShowingPopop({ ...showingPopup, show: false, title: "" });
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
                    padding: "16px 0 13px 15px",
                    fontSize: "1rem",
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
                  {showingPopup.title}
                </p>
                {showingPopup.title === "Bangunan - Pembangunan Optimum" ||
                showingPopup.title === "Bangunan - Air Bersih" ||
                showingPopup.title === "Bangunan - Transportasi" ? (
                  <>
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
                          <TabModuleContent
                            activeTab={activeModuleResTab === 0}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <h4 className="card-title" style={{ margin: "25px 0 10px 20px" }}>
                                Hasil Simulasi
                              </h4>
                              <div className="row" style={{ margin: "0 0 0 5px" }}>
                                <div className="col-md-6 d-flex align-items-center">
                                  <div className="d-flex flex-row align-items-center">
                                    <p className="font-weight-bold">Pembangunan</p>
                                  </div>
                                </div>
                                <div className="col-md-6 d-flex align-items-center">
                                  <div className="d-flex flex-row align-items-center">
                                    <label className="badge badge-danger" style={{ background: hasilWarnaBangunanKdbKlb }}>
                                      {hasilSimulasiBangunanKdbKlb}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="row" style={{ margin: "0 0 0 5px" }}>
                                <div className="col-md-12 d-flex align-items-center">
                                  <p>Berdasarkan hasil analisis, dalam rencana pembangunan yang diajukan</p>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    {contentBangunanKdbKlb.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                          <TabModuleContent
                            activeTab={activeModuleResTab === 1}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>{contentHasilPersilTanahKdbKlb.field_name}</td>
                                      <td>{contentHasilPersilTanahKdbKlb.field_value}</td>
                                    </tr>
                                    {contentPersilTanah.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                          <TabModuleContent
                            activeTab={activeModuleResTab === 2}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>{contentHasilPolaRuangKdbKlb.field_name}</td>
                                      <td>{contentHasilPolaRuangKdbKlb.field_value}</td>
                                    </tr>
                                    {contentPolaRuang.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                        </>
                      </TabModuleContent>
                      <TabModuleContent activeTab={activeTab === 1}>
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
                          <TabModuleContent
                            activeTab={activeModuleResTab === 0}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <h4 className="card-title" style={{ margin: "25px 0 10px 20px" }}>
                                Hasil Simulasi
                              </h4>
                              <div className="row" style={{ margin: "0 0 0 5px" }}>
                                <div className="col-md-6 d-flex align-items-center">
                                  <div className="d-flex flex-row align-items-center">
                                    <p className="font-weight-bold">Kemacetan</p>
                                  </div>
                                </div>
                                <div className="col-md-6 d-flex align-items-center">
                                  <div className="d-flex flex-row align-items-center">
                                    <label className="badge badge-danger" style={{ background: hasilWarnaBangunanKemacetan }}>
                                      {hasilSimulasiBangunanKemacetan}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="row" style={{ margin: "0 0 0 5px" }}>
                                <div className="col-md-12 d-flex align-items-center">
                                  <p>Berdasarkan hasil analisis, dalam rencana pembangunan yang diajukan</p>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    {contentBangunanKemacetan.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                          <TabModuleContent
                            activeTab={activeModuleResTab === 1}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>{contentHasilPersilTanahKemacetan.field_name}</td>
                                      <td>{contentHasilPersilTanahKemacetan.field_value}</td>
                                    </tr>
                                    {contentPersilTanah.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                          <TabModuleContent
                            activeTab={activeModuleResTab === 2}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>{contentHasilPolaRuangKemacetan.field_name}</td>
                                      <td>{contentHasilPolaRuangKemacetan.field_value}</td>
                                    </tr>
                                    {contentPolaRuang.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                        </>
                      </TabModuleContent>
                      <TabModuleContent activeTab={activeTab === 2}>
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
                          <TabModuleContent
                            activeTab={activeModuleResTab === 0}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <h4 className="card-title" style={{ margin: "25px 0 10px 20px" }}>
                                Hasil Simulasi
                              </h4>
                              <div className="row" style={{ margin: "0 0 0 5px" }}>
                                <div className="col-md-6 d-flex align-items-center">
                                  <div className="d-flex flex-row align-items-center">
                                    <p className="font-weight-bold">Air Bersih</p>
                                  </div>
                                </div>
                                <div className="col-md-6 d-flex align-items-center">
                                  <div className="d-flex flex-row align-items-center">
                                    <label className="badge badge-danger" style={{ background: hasilWarnaBangunanAirBersih }}>
                                      {hasilSimulasiBangunanAirBersih}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="row" style={{ margin: "0 0 0 5px" }}>
                                <div className="col-md-12 d-flex align-items-center">
                                  <p>Berdasarkan hasil analisis, dalam rencana pembangunan yang diajukan</p>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    {contentBangunanAirBersih.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                          <TabModuleContent
                            activeTab={activeModuleResTab === 1}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>{contentHasilPersilTanahAirBersih.field_name}</td>
                                      <td>{contentHasilPersilTanahAirBersih.field_value}</td>
                                    </tr>
                                    {contentPersilTanah.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                          <TabModuleContent
                            activeTab={activeModuleResTab === 2}
                            style={{ position: "absolute", height: "calc(100% - 240px)", width: "350px", overflow: "auto" }}
                          >
                            <div className="fade-in">
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>{contentHasilPolaRuangAirBersih.field_name}</td>
                                      <td>{contentHasilPolaRuangAirBersih.field_value}</td>
                                    </tr>
                                    {contentPolaRuang.map((fieldMap, i) => (
                                      <tr key={i}>
                                        <td>{fieldMap.field_name}</td>
                                        <td>{fieldMap.field_value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabModuleContent>
                        </>
                      </TabModuleContent>
                    </>
                  </>
                ) : (
                  <div className="table-responsive" style={{ position: "absolute", height: "calc(100% - 105px)", width: "350px", overflow: "auto" }}>
                    <table className="table">
                      <tbody>
                        {contentGeneral.map((fieldMap, i) => (
                          <tr key={i}>
                            <td>{fieldMap.field_name}</td>
                            <td>{fieldMap.field_value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
