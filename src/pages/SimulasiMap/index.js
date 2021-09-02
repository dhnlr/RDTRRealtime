import React, { useEffect, useRef, useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { isLoaded, loadModules } from "esri-loader";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import LoadingOverlay from "react-loading-overlay";

import "./simulasi.css";
import { Header, Menu } from "../../components";
import segmentationLegend from "./segmentationLegend.png";
import { config } from "../../Constants";

import styled, { css } from "styled-components";

import {
  TabsModule,
  TabModuleButton,
  TabModuleText,
  TabModuleContent,
} from "./tabModule";
import Pdf from "./pdf";
import dataScreenshotTemplate from "./data";
import getScreenshotData from "./QueryLayer";
import axios from "axios";

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
  let { state } = useLocation();

  useEffect(() => {
    if (!sessionStorage.token) {
      history.push("/login");
    }
  }, [history]);

  useEffect(() => {
    if (!state?.simulasiBangunan?.simulasiId) {
      history.push("/simulation");
    } else {
      handleExecuteSpCopy(0);
    }
  }, [state]);

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
  const [esriMap, setEsriMap] = useState(null);
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
  const [dataScreenshot, setDataScreenshot] = useState(dataScreenshotTemplate);
  const [dataHistory, setDataHistory] = useState({ id_bangunan: null });
  const [removeSegmentationFunc, setRemoveSegmentationFunc] = useState();
  const [showSegmentationFunc, setShowSegmentationFunc] = useState();
  const [isSegmentationActive, setIsSegmentationActive] = useState(false);
  const [segmentationBuildingId, setSegmentationBuildingId] = useState(null);
  const [itbxSum, setItbxSum] = useState(null);

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
  const [hasilSimulasiBangunanKdbKlb, setHasilSimulasiBangunanKdbKlb] =
    useState("");
  const [hasilWarnaBangunanKdbKlb, setHasilWarnaBangunanKdbKlb] = useState("");
  const [contentHasilPersilTanahKdbKlb, setContentHasilPersilTanahKdbKlb] =
    useState({});
  const [contentHasilPolaRuangKdbKlb, setContentHasilPolaRuangKdbKlb] =
    useState({});

  const [contentBangunanKemacetan, setContentBangunanKemacetan] = useState([]);
  const [hasilSimulasiBangunanKemacetan, setHasilSimulasiBangunanKemacetan] =
    useState("");
  const [hasilWarnaBangunanKemacetan, setHasilWarnaBangunanKemacetan] =
    useState("");
  const [
    contentHasilPersilTanahKemacetan,
    setContentHasilPersilTanahKemacetan,
  ] = useState({});
  const [contentHasilPolaRuangKemacetan, setContentHasilPolaRuangKemacetan] =
    useState({});

  const [contentBangunanAirBersih, setContentBangunanAirBersih] = useState([]);
  const [hasilSimulasiBangunanAirBersih, setHasilSimulasiBangunanAirBersih] =
    useState("");
  const [hasilWarnaBangunanAirBersih, setHasilWarnaBangunanAirBersih] =
    useState("");
  const [
    contentHasilPersilTanahAirBersih,
    setContentHasilPersilTanahAirBersih,
  ] = useState({});
  const [contentHasilPolaRuangAirBersih, setContentHasilPolaRuangAirBersih] =
    useState({});

  const [activeSebelumSesudah, setActiveSebelumSesudah] = useState({
    activeSebelum: false,
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
      city: [
        "Jakarta Utara",
        "Jakarta Barat",
        "Jakarta Pusat",
        "Jakarta Timur",
        "Jakarta Selatan",
      ],
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
          "esri/layers/SceneLayer",
          "esri/geometry/Polygon",
          "esri/symbols/PolygonSymbol3D",
          "esri/symbols/ExtrudeSymbol3DLayer",
          "esri/layers/GraphicsLayer",
        ],
        {
          css: true,
          version: "4.20",
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
          SceneLayer,
          Polygon,
          PolygonSymbol3D,
          ExtrudeSymbol3DLayer,
          GraphicsLayer,
        ]) => {
          var lantaiSebelum,
            lantai,
            lantaiAtas,
            lantaiSebelumKelewatan,
            segmentationGroupLayer = {};

          const map = new Map({
            basemap: "topo-vector",
            // ground: "world-elevation",
          });

          const view = new SceneView({
            container: mapRef.current,
            map: map,
            camera: {
              position: [106.7936983, -6.5989447, 682.98652],
              // position: [106.7936983, -6.5969447, 682.98652],
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
              color: [0, 0, 0],
              haloColor: [0, 255, 255],
              fillOpacity: 0.2,
            },
            popup: {
              dockEnabled: true,
              dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
              },
            },
          });

          const buildings3dLayer = new SceneLayer({
            url:
              config.url.ARCGIS_URL +
              "/Hosted/bangunan3d_mp/SceneServer/layers/0",
            title: "Bangunan Segmentasi",
          });

          function getSymbolBangunanSesudah(color) {
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
          const rendererBangunanSesudah = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            defaultSymbol: getSymbolBangunanSesudah([156, 156, 156]),
            defaultLabel: "Bangunan Kosong",
            field: "itbx",
            uniqueValueInfos: [
              {
                value: "I",
                symbol: getSymbolBangunanSesudah([56, 168, 0]),
                label: "I",
              },
              {
                value: "T/B",
                symbol: getSymbolBangunanSesudah([245, 202, 122]),
                label: "T/B",
              },
              {
                value: "X",
                symbol: getSymbolBangunanSesudah([230, 0, 0]),
                label: "X",
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
          const bangunanSesudahLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/sesudah/bangunan/FeatureServer/0",
            renderer: getRendererBangunan("itbx", "jlh_lantai"),
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
                      fieldName: "Shape__Area",
                      label: "Shape__Area",
                    },
                    {
                      fieldName: "jlh_lantai_sebelum",
                      label: "jlh_lantai_sebelum",
                    },
                    {
                      fieldName: "Shape__Area",
                      label: "Shape__Area",
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
                    {
                      fieldName: "namaszona",
                      label: "namaszona",
                    },
                    {
                      fieldName: "lantai_max",
                      label: "lantai_max",
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
                      fieldName: "fa_max",
                      label: "fa_max",
                    },
                    {
                      fieldName: "q_arus",
                      label: "q_arus",
                    },
                  ],
                },
              ],
            },
            outFields: ["*"],
          });

          const kapasitasAirLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/kapasitas_air/FeatureServer/0",
            title: "Kapasitas Air",
            popupTemplate: {
              title: "Kapasitas Air",
            },
            outFields: ["*"],
            editingEnabled: false,
          });

          const sampahTpsLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/Persampahan/Sampah_TPS/FeatureServer/0",
            title: "Sampah TPS",
            popupTemplate: {
              title: "Sampah TPS",
            },
            outFields: ["*"],
            editingEnabled: false,
          })

          const persilTanahSesudahLayer = new FeatureLayer({
            url: config.url.ARCGIS_URL + "/persiltanah/FeatureServer/0",
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
                    {
                      fieldName: "lantai_max_sebelum",
                      label: "lantai_max_sebelum",
                    },
                  ],
                },
              ],
            },
            outFields: ["id_polaruang", "namazona"],
          });

          const jalanSesudahLayer = new FeatureLayer({
            url:
              config.url.ARCGIS_URL + "/sesudah/jaringan_jalan/FeatureServer/0",
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
            url: config.url.ARCGIS_URL + "/Bangunan_Envelope/FeatureServer/0",
            renderer: rendererBuildingsEnvelope,
            elevationInfo: {
              mode: "on-the-ground",
            },
            title: "Bangunan - Amplop",
            popupTemplate: {
              title: "Bangunan - Amplop",
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
                      fieldName: "Shape__Area",
                      label: "Shape__Area",
                    },
                  ],
                },
              ],
            },
            outFields: ["jlh_lantai"],
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
            title: "Zonasi - Amplop",
            popupTemplate: {
              title: "Zonasi - Amplop",
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

          const basemapPolaRuangLayer = new VectorTileLayer({
            url:
              config.url.ARCGIS_URL +
              "/Hosted/KDBKLB_PolaRuang_base/VectorTileServer",
            title: "Basemap Pola Ruang",
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

          let utamaGroupLayer = new GroupLayer({
            title: "Layer Utama",
            layers: [
              polaRuangVersioningLayer,
              persilTanahSesudahLayer,
              kapasitasAirLayer,
              sampahTpsLayer,
              jalanSesudahLayer,
              bangunanSesudahLayer,
            ],
          });
          let tambahanGroupLayer = new GroupLayer({
            title: "Layer Tambahan",
            layers: [
              basemapPolaRuangLayer,
              polaRuangEnvelopeLayer,
              persilTanahBpn,
              buildingsEnvelopeLayer,
            ],
          });

          map.addMany([tambahanGroupLayer, utamaGroupLayer, buildings3dLayer]);

          jalanSesudahLayer.visible = false;
          polaRuangVersioningLayer.visible = false;
          persilTanahSesudahLayer.visible = false;
          kapasitasAirLayer.visible = false;
          sampahTpsLayer.visible = false;
          persilTanahBpn.visible = false;
          buildingsEnvelopeLayer.visible = false;
          basemapPolaRuangLayer.visible = false;
          polaRuangEnvelopeLayer.visible = false;
          buildings3dLayer.visible = false;

          async function finishLayer() {
            if (isMounted) {
              setMapLoaded(false);
            }
          }

          var highlight = null;
          view
            .whenLayerView(bangunanSesudahLayer)
            .then((layerView) => {
              return watchUtils.whenFalseOnce(layerView, "updating");
            })
            .then(() => {
              finishLayer();
            });

          view.when(function () {
            setEsriMap(map);
            // start layerlist
            var uniqueParentItems = [];
            const layerList = new LayerList({
              container: document.createElement("div"),
              view: view,
              listItemCreatedFunction: function (event) {
                var item = event.item;
                if (item.title === "Bangunan - Amplop") {
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
                } else if (item.title === "Zonasi - Amplop") {
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
                        setShowingPopop({
                          ...showingPopup,
                          show: false,
                          title: "",
                        });
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
                  layer: bangunanSesudahLayer,
                  enabled: true,
                  addEnabled: true,
                  updateEnabled: true,
                  deleteEnabled: true,
                  fieldConfig: [
                    {
                      name: "jenis_bang",
                      label: "Jenis Bangunan",
                    },
                    {
                      name: "Shape__Area",
                      label: "Luas Tapak (m2)",
                      editable: false,
                    },
                    {
                      name: "fa",
                      label: "Luas Bangunan (m2)",
                      editable: false,
                    },
                    {
                      name: "jlh_lantai",
                      label: "Jumlah Lantai",
                    },
                    {
                      name: "kegiatan",
                      label: "Kegiatan",
                    },
                  ],
                },
                {
                  layer: jalanSesudahLayer,
                  enabled: true,
                  addEnabled: true,
                  updateEnabled: true,
                  deleteEnabled: true,
                  fieldConfig: [
                    {
                      name: "namobj",
                      label: "namobj",
                    },
                    {
                      name: "lebar",
                      label: "lebar",
                    },
                    {
                      name: "jalan_lhr",
                      label: "jalan_lhr",
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
                    // {
                    //   name: "namazona",
                    //   label: "namazona",
                    // },
                    // {
                    //   name: "kdzona",
                    //   label: "kdzona",
                    // },
                    {
                      name: "namaszona",
                      label: "namaszona",
                    },
                    // {
                    //   name: "kdszona",
                    //   label: "kdszona",
                    // },
                  ],
                },
              ],
            });
            editor.viewModel.watch("state", function () {
              if (
                editor.viewModel.state === "awaiting-feature-to-update" &&
                segmentationGroupLayer
              ) {
                // map.remove(segmentationGroupLayer);
                // bangunanSesudahLayer.definitionExpression = "";
                hideSegementationGroupLayer();
              }
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
              jalanSesudahLayer.popupEnabled = false;
              polaRuangVersioningLayer.popupEnabled = false;
              persilTanahSesudahLayer.popupEnabled = false;
              kapasitasAirLayer.popupEnabled = false;
              persilTanahBpn.popupEnabled = false;
              buildingsEnvelopeLayer.popupEnabled = false;
              basemapPolaRuangLayer.popupEnabled = false;
              polaRuangEnvelopeLayer.popupEnabled = false;
              bangunanSesudahLayer.popupEnabled = false;
              buildings3dLayer.popupEnabled = false;
              // map.remove(segmentationGroupLayer);
              // bangunanSesudahLayer.definitionExpression = "";
              hideSegementationGroupLayer();
              view.on("click", function (event) {
                // Remove the previous highlights
                if (highlight) {
                  highlight.remove();
                }
                let pointBuildings = event.mapPoint;

                view
                  .whenLayerView(bangunanSesudahLayer)
                  .then(function (bangunanSesudahLayerView) {
                    var query = bangunanSesudahLayer.createQuery();
                    query.geometry = pointBuildings;
                    bangunanSesudahLayerView
                      .queryFeatures(query)
                      .then(function (result) {
                        if (result.features.length > 0) {
                          result.features.forEach(function (feature) {
                            var objectId = feature.attributes.objectid_1;
                            // Highlight the feature passing the objectId to the method
                            highlight =
                              bangunanSesudahLayerView.highlight(objectId);
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
            document
              .getElementById("markingBuildings")
              .addEventListener("click", handleMarking);
            // end marking building

            // start print simulasi
            const printExp = new Expand({
              expandIconClass: "esri-icon-printer",
              expandTooltip: "Cetak Hasil Simulasi",
              content: document.getElementById("printExpDiv"),
              view: view,
            });
            view.ui.add({
              component: printExp,
              position: "top-left",
            });

            var screenshot = document.getElementsByClassName("screenshot");
            for (var i = 0; i < screenshot.length; i++) {
              screenshot[i].addEventListener("click", function () {
                view.takeScreenshot().then((photo) => {
                  var obj = dataScreenshot;
                  obj.photo[this.id] = photo.dataUrl;
                  setDataScreenshot(obj);
                  var img = document.getElementById("photo_" + this.id);
                  img.src = photo.dataUrl;
                  img.style.display = "block";
                  img.style.maxWidth = "100%";
                });
              });
            }

            const selectBuildingPrint = () => {
              view.container.classList.add("screenshotCursor");
              jalanSesudahLayer.popupEnabled = false;
              polaRuangVersioningLayer.popupEnabled = false;
              persilTanahSesudahLayer.popupEnabled = false;
              kapasitasAirLayer.popupEnabled = false;
              persilTanahBpn.popupEnabled = false;
              buildingsEnvelopeLayer.popupEnabled = false;
              basemapPolaRuangLayer.popupEnabled = false;
              polaRuangEnvelopeLayer.popupEnabled = false;
              bangunanSesudahLayer.popupEnabled = false;
              buildings3dLayer.popupEnabled = false;
              // map.remove(segmentationGroupLayer);
              // bangunanSesudahLayer.definitionExpression = "";
              hideSegementationGroupLayer();
              view.on("click", function (event) {
                if (highlight) {
                  highlight.remove();
                }
                let pointBuildings = event.mapPoint;

                var query = bangunanSesudahLayer.createQuery();
                query.geometry = pointBuildings;
                view
                  .whenLayerView(bangunanSesudahLayer)
                  .then(function (bangunanSesudahLayerView) {
                    bangunanSesudahLayer
                      .queryFeatures(query)
                      .then(function (result) {
                        if (result.features.length > 0) {
                          result.features.forEach(function (feature) {
                            var objectId = feature.attributes.objectid_1;
                            var id_bangunan = feature.attributes.id_bangunan;
                            getScreenshotData(dataScreenshot, id_bangunan).then(
                              (result) => {
                                setDataScreenshot(result);
                                view.container.classList.remove(
                                  "screenshotCursor"
                                );
                                highlight =
                                  bangunanSesudahLayerView.highlight(objectId);
                                document.getElementById(
                                  "id_bangunan_print"
                                ).innerText = "ID bangunan: " + id_bangunan;
                              }
                            );
                          });
                        }
                        jalanSesudahLayer.popupEnabled = true;
                        polaRuangVersioningLayer.popupEnabled = true;
                        persilTanahSesudahLayer.popupEnabled = true;
                        kapasitasAirLayer.popupEnabled = true;
                        persilTanahBpn.popupEnabled = true;
                        buildingsEnvelopeLayer.popupEnabled = true;
                        basemapPolaRuangLayer.popupEnabled = true;
                        polaRuangEnvelopeLayer.popupEnabled = true;
                        bangunanSesudahLayer.popupEnabled = true;
                        buildings3dLayer.popupEnabled = true;
                      });
                  });
              });
            };

            var cetak = () => {
              if (
                dataScreenshot.photo.pembangunan_optimum_sebelum &&
                dataScreenshot.photo.pembangunan_optimum_sesudah &&
                dataScreenshot.photo.kemacetan_sebelum &&
                dataScreenshot.photo.kemacetan_sesudah &&
                dataScreenshot.photo.air_bersih_sebelum &&
                dataScreenshot.photo.air_bersih_sesudah &&
                dataScreenshot.id_bangunan
              ) {
                Pdf(dataScreenshot);
              } else {
                Swal.fire(
                  "Maaf",
                  "Lengkapi foto dan pilih bangunan untuk mencetak hasil simulasi",
                  "error"
                );
              }
            };

            document
              .getElementById("pilih_bangunan_print")
              .addEventListener("click", selectBuildingPrint);
            document
              .getElementById("print_simulasi")
              .addEventListener("click", cetak);
            // end print simulasi

            // start history simulasi
            const historyExp = new Expand({
              expandIconClass: "esri-icon-duplicate",
              expandTooltip: "Analisis Sejarah Simulasi",
              content: document.getElementById("historyExpDiv"),
              view: view,
            });
            view.ui.add({
              component: historyExp,
              position: "top-left",
            });

            const selectBuildingHistory = () => {
              view.container.classList.add("screenshotCursor");
              jalanSesudahLayer.popupEnabled = false;
              polaRuangVersioningLayer.popupEnabled = false;
              persilTanahSesudahLayer.popupEnabled = false;
              kapasitasAirLayer.popupEnabled = false;
              persilTanahBpn.popupEnabled = false;
              buildingsEnvelopeLayer.popupEnabled = false;
              basemapPolaRuangLayer.popupEnabled = false;
              polaRuangEnvelopeLayer.popupEnabled = false;
              bangunanSesudahLayer.popupEnabled = false;
              buildings3dLayer.popupEnabled = false;
              hideSegementationGroupLayer();
              view.on("click", function (event) {
                if (highlight) {
                  highlight.remove();
                }
                let pointBuildings = event.mapPoint;

                var query = bangunanSesudahLayer.createQuery();
                query.geometry = pointBuildings;
                view
                  .whenLayerView(bangunanSesudahLayer)
                  .then(function (bangunanSesudahLayerView) {
                    bangunanSesudahLayer
                      .queryFeatures(query)
                      .then(function (result) {
                        if (result.features.length > 0) {
                          result.features.forEach(function (feature) {
                            var objectId = feature.attributes.objectid_1;
                            var id_bangunan = feature.attributes.id_bangunan;
                            setDataHistory({
                              id_bangunan: feature.attributes.id_bangunan,
                            });
                            view.container.classList.remove("screenshotCursor");
                            highlight =
                              bangunanSesudahLayerView.highlight(objectId);
                            document.getElementById(
                              "id_bangunan_history"
                            ).innerText = "ID bangunan: " + id_bangunan;
                            // getScreenshotData(dataScreenshot, id_bangunan).then(
                            //   (result) => {
                            //     setDataHistory(result);
                            //     view.container.classList.remove("screenshotCursor");
                            //     highlight =
                            //       bangunanSesudahLayerView.highlight(objectId);
                            //     document.getElementById(
                            //       "id_bangunan_history"
                            //     ).innerText = "ID bangunan: " + id_bangunan;
                            //   }
                            // );
                          });
                        }
                        jalanSesudahLayer.popupEnabled = true;
                        polaRuangVersioningLayer.popupEnabled = true;
                        persilTanahSesudahLayer.popupEnabled = true;
                        kapasitasAirLayer.popupEnabled = true;
                        persilTanahBpn.popupEnabled = true;
                        buildingsEnvelopeLayer.popupEnabled = true;
                        basemapPolaRuangLayer.popupEnabled = true;
                        polaRuangEnvelopeLayer.popupEnabled = true;
                        bangunanSesudahLayer.popupEnabled = true;
                        buildings3dLayer.popupEnabled = true;
                      });
                  });
              });
            };

            // document
            //   .getElementById("pilih_bangunan_history")
            //   .addEventListener("click", selectBuildingHistory);
            // document
            //   .getElementById("history_simulasi")
            //   .addEventListener("click", historyAnalysis);
            // end history simulasi

            // start legend
            const legend = new Legend({
              container: document.createElement("div"),
              view: view,
              layerInfos: [
                { layer: jalanSesudahLayer },
                { layer: polaRuangVersioningLayer },
                { layer: persilTanahSesudahLayer },
                { layer: kapasitasAirLayer },
                { layer: persilTanahBpn },
                { layer: buildingsEnvelopeLayer },
                { layer: basemapPolaRuangLayer },
                { layer: polaRuangEnvelopeLayer },
                { layer: bangunanSesudahLayer },
                { layer: buildings3dLayer },
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
                      xmin: 11888033.29,
                      ymin: -735411.75,
                      xmax: 11888421.13,
                      ymax: -735691.8,
                    },
                  },
                }),
                new Bookmark({
                  name: "Kel. Kebon Kalapa",
                  viewpoint: {
                    targetGeometry: {
                      type: "extent",
                      spatialReference: {
                        wkid: 102100,
                      },
                      xmin: 11887075.39,
                      ymin: -735077.55,
                      xmax: 11887416.27,
                      ymax: -735323.69,
                    },
                  },
                }),
                new Bookmark({
                  name: "Kel. Babakan",
                  viewpoint: {
                    targetGeometry: {
                      type: "extent",
                      spatialReference: {
                        latestWkid: 3857,
                        wkid: 102100,
                      },
                      xmin: 11888886.98,
                      ymin: -735127.74,
                      xmax: 11889492.98,
                      ymax: -735565.32,
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

              // start segmentation drawing function
              // bangunanSesudahLayer.definitionExpression = "";
              // map.remove(segmentationGroupLayer);
              hideSegementationGroupLayer();
              // end segmentation drawing function

              let fieldsArr = [];
              features[0].layer.fields.map((fieldVal) => {
                if (features[0].attributes[fieldVal.name] !== undefined) {
                  fieldsArr.push({
                    field_name: fieldVal.name,
                    field_value: features[0].attributes[fieldVal.name],
                  });
                }
              });
              if (features[0].layer.title === "Bangunan") {
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
                    field_value:
                      features[0].attributes.melampaui_tinggi_sebelum,
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
                    field_value: features[0].attributes.izin_macet_sebelum, //10
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
                    field_name: "Shape__Area",
                    field_value: features[0].attributes.Shape__Area,
                  },
                  {
                    field_name: "Shape__Area",
                    field_value: features[0].attributes.Shape__Area,
                  },
                  {
                    field_name: "fa_sebelum",
                    field_value: features[0].attributes.fa_sebelum, //20
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
                    field_value: features[0].attributes.penduduk_y5_pertambahan, //30
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
                    field_value: features[0].attributes.keb_air_harian_y8, //40
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
                    field_value: features[0].attributes.bangkitan, //50
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
                  // {
                  //   field_name: "izin_macet_y6",
                  //   field_value: features[0].attributes.izin_macet_y6,
                  // },
                  // {
                  //   field_name: "izin_macet_y7",
                  //   field_value: features[0].attributes.izin_macet_y7,
                  // },
                  // {
                  //   field_name: "izin_macet_y8",
                  //   field_value: features[0].attributes.izin_macet_y8,
                  // },
                  // {
                  //   field_name: "izin_macet_y9",
                  //   field_value: features[0].attributes.izin_macet_y9,
                  // },
                  // {
                  //   field_name: "izin_macet_y10",
                  //   field_value: features[0].attributes.izin_macet_y10,
                  // },
                  // {
                  //   field_name: "izin_air_y6_sebelum",
                  //   field_value: features[0].attributes.izin_air_y6_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y7_sebelum",
                  //   field_value: features[0].attributes.izin_air_y7_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y8_sebelum",
                  //   field_value: features[0].attributes.izin_air_y8_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y9_sebelum",
                  //   field_value: features[0].attributes.izin_air_y9_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y10_sebelum",
                  //   field_value: features[0].attributes.izin_air_y10_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_sebelum",
                  //   field_value: features[0].attributes.izin_macet_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y6_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y6_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y7_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y7_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y8_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y8_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y9_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y9_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y10_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y10_sebelum,
                  // },
                  {
                    field_name: "sumber",
                    field_value: features[0].attributes.sumber,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                  {
                    field_name: "namaszona",
                    field_value: features[0].attributes.namaszona, //60
                  },
                  {
                    field_name: "lantai_max",
                    field_value: features[0].attributes.lantai_max,
                  },
                  {
                    field_name: "kdb",
                    field_value: features[0].attributes.kdb,
                  },
                  {
                    field_name: "klb",
                    field_value: features[0].attributes.klb,
                  },
                  {
                    field_name: "kdh",
                    field_value: features[0].attributes.kdh,
                  },
                  {
                    field_name: "fa_max",
                    field_value: features[0].attributes.fa_max,
                  },
                  {
                    field_name: "q_arus",
                    field_value: features[0].attributes.q_arus,
                  },
                  {
                    field_name: "namaszona_sebelum",
                    field_value: features[0].attributes.namaszona_sebelum,
                  },
                  {
                    field_name: "kdb_sebelum",
                    field_value: features[0].attributes.kdb_sebelum,
                  },
                  {
                    field_name: "klb_sebelum",
                    field_value: features[0].attributes.klb_sebelum,
                  },
                  {
                    field_name: "kdh_sebelum",
                    field_value: features[0].attributes.kdh_sebelum, //70
                  },
                  {
                    field_name: "lantai_max_sebelum",
                    field_value: features[0].attributes.lantai_max_sebelum,
                  },
                  {
                    field_name: "status_itbx_sebelum",
                    field_value: features[0].attributes.status_itbx_sebelum, //72
                  },
                  {
                    field_name: "status_itbx",
                    field_value: features[0].attributes.status_itbx,
                  },
                  {
                    field_name: "kegiatan_sebelum",
                    field_value: features[0].attributes.kegiatan_sebelum, //74
                  },
                  {
                    field_name: "kegiatan",
                    field_value: features[0].attributes.kegiatan,
                  },
                  {
                    field_name: "kbli_sebelum",
                    field_value: features[0].attributes.kbli_sebelum,
                  },
                  {
                    field_name: "kbli",
                    field_value: features[0].attributes.kbli,
                  },
                  {
                    field_name: "jenis_bang_sebelum",
                    field_value: features[0].attributes.jenis_bang_sebelum, //78
                  },
                  {
                    field_name: "q_arus_sebelum",
                    field_value: features[0].attributes.q_arus_sebelum,
                  },
                  {
                    field_name: "kdb_rdtr",
                    field_value: features[0].attributes.kdb_rdtr, //80
                  },
                  {
                    field_name: "klb_rdtr",
                    field_value: features[0].attributes.klb_rdtr,
                  },
                  {
                    field_name: "kdh_rdtr",
                    field_value: features[0].attributes.kdh_rdtr, //82
                  },
                  {
                    field_name: "keb_air_harian_y5_sebelum",
                    field_value:
                      features[0].attributes.keb_air_harian_y5_sebelum,
                  },
                  {
                    field_name: "pdam_kapasitas_harian_sebelum",
                    field_value:
                      features[0].attributes.pdam_kapasitas_harian_sebelum,
                  },
                  {
                    field_name: "izin_sampah_y5",
                    field_value:
                      features[0].attributes.izin_sampah_y5,
                  },
                ]);
                setHasilSimulasiBangunanKdbKlb(
                  features[0].attributes.melampaui_tinggi
                );
                if (
                  features[0].attributes.melampaui_tinggi ===
                  "Belum melampaui jumlah lantai maksimal"
                ) {
                  setHasilWarnaBangunanKdbKlb("#FFFF00");
                } else if (
                  features[0].attributes.melampaui_tinggi ===
                  "Melampaui jumlah lantai maksimal"
                ) {
                  setHasilWarnaBangunanKdbKlb("#FF0000");
                } else if (
                  features[0].attributes.melampaui_tinggi ===
                  "Jumlah lantai sudah maksimal"
                ) {
                  setHasilWarnaBangunanKdbKlb("#4CE600");
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
                    field_value:
                      features[0].attributes.melampaui_tinggi_sebelum,
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
                    field_name: "Shape__Area",
                    field_value: features[0].attributes.Shape__Area,
                  },
                  {
                    field_name: "Shape__Area",
                    field_value: features[0].attributes.Shape__Area,
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
                  // {
                  //   field_name: "izin_macet_y6",
                  //   field_value: features[0].attributes.izin_macet_y6,
                  // },
                  // {
                  //   field_name: "izin_macet_y7",
                  //   field_value: features[0].attributes.izin_macet_y7,
                  // },
                  // {
                  //   field_name: "izin_macet_y8",
                  //   field_value: features[0].attributes.izin_macet_y8,
                  // },
                  // {
                  //   field_name: "izin_macet_y9",
                  //   field_value: features[0].attributes.izin_macet_y9,
                  // },
                  // {
                  //   field_name: "izin_macet_y10",
                  //   field_value: features[0].attributes.izin_macet_y10,
                  // },
                  // {
                  //   field_name: "izin_air_y6_sebelum",
                  //   field_value: features[0].attributes.izin_air_y6_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y7_sebelum",
                  //   field_value: features[0].attributes.izin_air_y7_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y8_sebelum",
                  //   field_value: features[0].attributes.izin_air_y8_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y9_sebelum",
                  //   field_value: features[0].attributes.izin_air_y9_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y10_sebelum",
                  //   field_value: features[0].attributes.izin_air_y10_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_sebelum",
                  //   field_value: features[0].attributes.izin_macet_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y6_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y6_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y7_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y7_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y8_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y8_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y9_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y9_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y10_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y10_sebelum,
                  // },
                  {
                    field_name: "sumber",
                    field_value: features[0].attributes.sumber,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                ]);
                setHasilSimulasiBangunanKemacetan(
                  features[0].attributes.izin_macet
                );
                if (
                  features[0].attributes.izin_macet === "Ditolak/rekomendasi"
                ) {
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
                    field_value:
                      features[0].attributes.melampaui_tinggi_sebelum,
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
                    field_name: "Shape__Area",
                    field_value: features[0].attributes.Shape__Area,
                  },
                  {
                    field_name: "Shape__Area",
                    field_value: features[0].attributes.Shape__Area,
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
                  // {
                  //   field_name: "izin_macet_y6",
                  //   field_value: features[0].attributes.izin_macet_y6,
                  // },
                  // {
                  //   field_name: "izin_macet_y7",
                  //   field_value: features[0].attributes.izin_macet_y7,
                  // },
                  // {
                  //   field_name: "izin_macet_y8",
                  //   field_value: features[0].attributes.izin_macet_y8,
                  // },
                  // {
                  //   field_name: "izin_macet_y9",
                  //   field_value: features[0].attributes.izin_macet_y9,
                  // },
                  // {
                  //   field_name: "izin_macet_y10",
                  //   field_value: features[0].attributes.izin_macet_y10,
                  // },
                  // {
                  //   field_name: "izin_air_y6_sebelum",
                  //   field_value: features[0].attributes.izin_air_y6_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y7_sebelum",
                  //   field_value: features[0].attributes.izin_air_y7_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y8_sebelum",
                  //   field_value: features[0].attributes.izin_air_y8_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y9_sebelum",
                  //   field_value: features[0].attributes.izin_air_y9_sebelum,
                  // },
                  // {
                  //   field_name: "izin_air_y10_sebelum",
                  //   field_value: features[0].attributes.izin_air_y10_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_sebelum",
                  //   field_value: features[0].attributes.izin_macet_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y6_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y6_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y7_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y7_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y8_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y8_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y9_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y9_sebelum,
                  // },
                  // {
                  //   field_name: "izin_macet_y10_sebelum",
                  //   field_value: features[0].attributes.izin_macet_y10_sebelum,
                  // },
                  {
                    field_name: "sumber",
                    field_value: features[0].attributes.sumber,
                  },
                  {
                    field_name: "kabkot",
                    field_value: features[0].attributes.kabkot,
                  },
                ]);
                setHasilSimulasiBangunanAirBersih(
                  features[0].attributes.izin_air_y5
                );
                if (
                  features[0].attributes.izin_air_y5 === "Ditolak/rekomendasi"
                ) {
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
                          field_name: "Shape__Area",
                          field_value: features.Shape__Area,
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
                      var features_pola_ruang =
                        response.data.features[0].attributes;
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
                          field_value:
                            features_pola_ruang.status_pemb_optimum_sebelum,
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

                Axios.get(config.url.API_URL + "/MasterData/Itbx/GetList", {
                  headers: { Authorization: "Bearer " + sessionStorage.token },
                  params: {
                    rdtr: features[0].attributes.kabkot,
                  },
                })
                  .then(({ data }) => {
                    if (data.status.succeeded) {
                      setItbxSum(data.obj);
                    }
                  })
                  .catch(function (error) {
                    // handle error
                    console.log("error check", error);
                  });

                // start segmentation drawing function
                if (features[0].attributes.objectid_1) {
                  setSegmentationBuildingId(features[0].attributes.objectid_1);
                  setRemoveSegmentationFunc(() => () => {
                    bangunanSesudahLayer.definitionExpression = "";
                    map.remove(segmentationGroupLayer);
                    setIsSegmentationActive(false);
                    if (document.getElementById("segmentationLegendCard")) {
                      document.getElementById(
                        "segmentationLegendCard"
                      ).style.display = "none";
                    }
                  });
                  setShowSegmentationFunc((id) => (id) => {
                    bangunanSesudahLayer.definitionExpression =
                      "NOT objectid_1 = " + id;
                    map.add(segmentationGroupLayer);
                    view.whenLayerView(lantaiAtas).then(function (layerView) {
                      layerView.highlight(lantaiAtas.graphics);
                    });
                    view.whenLayerView(lantai).then(function (layerView) {
                      layerView.highlight(lantai.graphics);
                    });
                    view
                      .whenLayerView(lantaiSebelum)
                      .then(function (layerView) {
                        layerView.highlight(lantaiSebelum.graphics);
                      });
                    view
                      .whenLayerView(lantaiSebelumKelewatan)
                      .then(function (layerView) {
                        layerView.highlight(lantaiSebelumKelewatan.graphics);
                      });
                    if (document.getElementById("segmentationLegendCard")) {
                      document.getElementById(
                        "segmentationLegendCard"
                      ).style.display = "block";
                    }
                  });
                  getRing(features[0].attributes.objectid_1);
                  // features[0].layer.definitionExpression =
                  //   "NOT id_bangunan = " + features[0].attributes.id_bangunan;
                }
                // end segmentation drawing function
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
                    field_value:
                      features[0].attributes.status_pemb_optimum_sebelum,
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

          // start segmentation drawing function
          /************************************************************
           * Get polygon id from feature service and draw it when available
           ************************************************************/
          var getRing = (id) => {
            var request = new XMLHttpRequest();
            request.open(
              "GET",
              "https://rdtr.onemap.id/server/rest/services/sesudah/bangunan/FeatureServer/0/query?where=objectid_1=" +
                id +
                "&outFields=*&outSR=4326&f=pjson",
              true
            );

            request.onload = function () {
              if (this.status >= 200 && this.status < 400) {
                // Success!
                var { features } = JSON.parse(this.response);
                if (features[0])
                  drawGraphic(
                    features[0].geometry.rings,
                    features[0].attributes
                  );
              } else {
                // We reached our target server, but it returned an error
              }
            };

            request.onerror = function () {
              // There was a connection error of some sort
            };

            request.send();
          };

          /************************************************************
           * Draw polygon
           * Parameterize init Symbol by size and material
           ************************************************************/
          function getSymbol(size, color) {
            return new PolygonSymbol3D({
              symbolLayers: [
                new ExtrudeSymbol3DLayer({
                  size: size,
                  material: { color: color },
                }),
              ],
            });
          }

          /************************************************************
           * Draw polygon
           ************************************************************/
          var drawGraphic = (ring, attributes) => {
            console.log(
              attributes.jlh_lantai_sebelum,
              attributes.jlh_lantai,
              attributes.lantai_max
            );
            var polygon = new Polygon({
              rings: ring,
              spatialReference: { wkid: 4326 },
            });

            lantaiSebelum = new GraphicsLayer({
              title: "Lantai Sebelum",
              elevationInfo: {
                mode: "relative-to-ground",
                featureExpressionInfo: {
                  expression: "0", //dasar
                },
                unit: "meters",
              },
            });
            lantaiSebelum.add(
              new Graphic({
                geometry: polygon,
                symbol: getSymbol(
                  attributes.jlh_lantai_sebelum < attributes.lantai_max &&
                    attributes.jlh_lantai_sebelum
                    ? attributes.jlh_lantai_sebelum < attributes.jlh_lantai
                      ? attributes.jlh_lantai_sebelum
                      : attributes.jlh_lantai < attributes.lantai_max &&
                        attributes.jlh_lantai
                      ? attributes.jlh_lantai
                      : attributes.lantai_max
                      ? attributes.lantai_max
                      : -1
                    : attributes.lantai_max && attributes.jlh_lantai
                    ? attributes.jlh_lantai > attributes.lantai_max
                      ? attributes.lantai_max
                      : attributes.jlh_lantai
                    : attributes.jlh_lantai &&
                      !attributes.jlh_lantai_sebelum &&
                      !attributes.lantai_max
                    ? attributes.jlh_lantai
                    : !attributes.jlh_lantai &&
                      attributes.jlh_lantai_sebelum &&
                      !attributes.lantai_max
                    ? attributes.jlh_lantai_sebelum
                    : -1,
                  [0, 248, 4, 1]
                ), //lantai sebelum
              })
            );
            // map.add(lantaiSebelum);

            lantaiSebelumKelewatan = new GraphicsLayer({
              title: "Lantai Sebelum dengan Tinggi Berlebih",
              elevationInfo: {
                mode: "relative-to-ground",
                featureExpressionInfo: {
                  expression: attributes.lantai_max, //maksimum
                },
                unit: "meters",
              },
            });
            lantaiSebelumKelewatan.add(
              new Graphic({
                geometry: polygon,
                symbol: getSymbol(
                  attributes.jlh_lantai_sebelum > attributes.lantai_max
                    ? attributes.jlh_lantai_sebelum < attributes.jlh_lantai
                      ? attributes.jlh_lantai_sebelum - attributes.lantai_max
                      : attributes.jlh_lantai > attributes.lantai_max
                      ? attributes.jlh_lantai - attributes.lantai_max
                      : -1
                    : -1,
                  [255, 128, 0, 1]
                ), //lantai sebelum
              })
            );

            // lantaiSebelum = new GraphicsLayer({
            //   title: "Lantai Sebelum",
            //   elevationInfo: {
            //     mode: "relative-to-ground",
            //     featureExpressionInfo: {
            //       expression: "0", //dasar
            //     },
            //     unit: "meters",
            //   },
            // });
            // lantaiSebelum.add(
            //   new Graphic({
            //     geometry: polygon,
            //     symbol: getSymbol(
            //       (attributes.jlh_lantai_sebelum && attributes.lantai_max) && attributes.jlh_lantai_sebelum < attributes.jlh_lantai
            //         ? attributes.jlh_lantai_sebelum
            //         : attributes.jlh_lantai,
            //         (attributes.jlh_lantai === attributes.jlh_lantai_sebelum ||
            //           !attributes.jlh_lantai_sebelum) &&
            //           (attributes.jlh_lantai_sebelum > attributes.lantai_max ||
            //             attributes.jlh_lantai > attributes.lantai_max)
            //         ? [251, 0, 0, 1]
            //         : [0, 248, 4, 1]
            //     ), //lantai sebelum
            //   })
            // );
            // map.add(lantaiSebelum);

            lantai = new GraphicsLayer({
              title: "Lantai dengan Tinggi Potensial",
              elevationInfo: {
                mode: "relative-to-ground",
                featureExpressionInfo: {
                  expression: attributes.jlh_lantai_sebelum, //lantai sebelum
                },
                unit: "meters",
              },
            });
            lantai.add(
              new Graphic({
                geometry: polygon,
                symbol: getSymbol(
                  attributes.jlh_lantai > attributes.jlh_lantai_sebelum &&
                    attributes.jlh_lantai_sebelum
                    ? attributes.lantai_max - attributes.jlh_lantai_sebelum
                    : -1,
                  [102, 178, 255, 1]
                ), //lantai max - lantai sebelum
              })
            );
            // map.add(lantai);

            lantaiAtas = new GraphicsLayer({
              title: "Lantai Sesudah dengan Tinggi Berlebih",
              elevationInfo: {
                mode: "relative-to-ground",
                featureExpressionInfo: {
                  expression:
                    attributes.jlh_lantai_sebelum +
                    (attributes.lantai_max - attributes.jlh_lantai_sebelum > 0
                      ? attributes.lantai_max - attributes.jlh_lantai_sebelum
                      : 0), //lantai (lantai max - lantai sebelum) + lantai ssebelum
                },
                unit: "meters",
              },
            });
            lantaiAtas.add(
              new Graphic({
                geometry: polygon,
                symbol: getSymbol(
                  attributes.jlh_lantai > attributes.jlh_lantai_sebelum &&
                    attributes.jlh_lantai_sebelum
                    ? attributes.jlh_lantai -
                        attributes.jlh_lantai_sebelum -
                        (attributes.lantai_max - attributes.jlh_lantai_sebelum >
                        0
                          ? attributes.lantai_max -
                            attributes.jlh_lantai_sebelum
                          : 0)
                    : -1,
                  [0, 0, 0, 1]
                ), //lantai total - lantai sebelum - lantai (lantai max - lantai sebelum)
              })
            );
            // map.add(lantaiAtas);
            segmentationGroupLayer = new GroupLayer({
              title: "Layer Segmentasi",
              layers: [
                lantaiSebelum,
                lantaiSebelumKelewatan,
                lantai,
                lantaiAtas,
              ],
              blendMode: "destination-over",
              listMode: "hide",
              // visible: false
            });

            // map.add(segmentationGroupLayer)

            // view.whenLayerView(lantaiAtas).then(function(layerView){
            //   layerView.highlight(lantaiAtas.graphics)
            // })
            // view.whenLayerView(lantai).then(function(layerView){
            //   layerView.highlight(lantai.graphics)
            // })
            // view.whenLayerView(lantaiSebelum).then(function(layerView){
            //   layerView.highlight(lantaiSebelum.graphics)
            // })
            // view.whenLayerView(lantaiSebelumKelewatan).then(function(layerView){
            //   layerView.highlight(lantaiSebelumKelewatan.graphics)
            // })
          };

          var hideSegementationGroupLayer = () => {
            map.remove(segmentationGroupLayer);
            bangunanSesudahLayer.definitionExpression = "";
            setIsSegmentationActive(false);
            // segmentationGroupLayer.visible = false
            if (document.getElementById("segmentationLegendCard")) {
              document.getElementById("segmentationLegendCard").style.display =
                "none";
            }
          };
          // end segementation drawing function

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
          const headers = {
            Authorization: "Bearer " + sessionStorage.token,
            "Content-Type": "application/json",
          };
          Axios.post(
            config.url.API_URL +
              "/Pembangunan/ExecuteSpPembangunanOptimum?nib=" +
              featuresPersilTanah[0].attributes.nib,
            {},
            { headers }
          )
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
    if (segmentationBuildingId) {
      removeSegmentationFunc();
    }
    setActiveSebelumSesudah({
      activeSebelum: false,
    });
    let layerBangunan = esriMap.allLayers.find(function (layer) {
      return layer.title === "Bangunan";
    });
    let layerPolaRuang = esriMap.allLayers.find(function (layer) {
      return layer.title === "Pola Ruang Versioning";
    });
    let layerKapasitasAir = esriMap.allLayers.find(function (layer) {
      return layer.title === "Kapasitas Air";
    });
    let layerJaringanJalan = esriMap.allLayers.find(function (layer) {
      return layer.title === "Jaringan Jalan";
    });
    layerBangunan.renderer = getRendererBangunan("itbx", "jlh_lantai");
    layerPolaRuang.renderer = getRendererPolaRuang("namaszona");
    layerKapasitasAir.renderer = getRendererKapasitasAir("izin_air");
    layerJaringanJalan.renderer = getRendererJaringanJalan("los");
    layerBangunan.refresh();
    layerPolaRuang.refresh();
    layerKapasitasAir.refresh();
    layerJaringanJalan.refresh();
    setItbxSum(null);
    stateView.popup.close();
    setShowingPopop({ ...showingPopup, show: false, title: "" });
  };
  // end close showing popup
  const handleSebelumSesudah = () => {
    let layerBangunan = esriMap.allLayers.find(function (layer) {
      return layer.title === "Bangunan";
    });
    let layerPolaRuang = esriMap.allLayers.find(function (layer) {
      return layer.title === "Pola Ruang Versioning";
    });
    let layerKapasitasAir = esriMap.allLayers.find(function (layer) {
      return layer.title === "Kapasitas Air";
    });
    let layerJaringanJalan = esriMap.allLayers.find(function (layer) {
      return layer.title === "Jaringan Jalan";
    });
    if (!activeSebelumSesudah.activeSebelum) {
      layerBangunan.renderer = getRendererBangunan(
        "itbx_sebelum",
        "jlh_lantai_sebelum"
      );
      layerPolaRuang.renderer = getRendererPolaRuang("namaszona_sebelum");
      layerKapasitasAir.renderer = getRendererKapasitasAir("izin_air_sebelum");
      layerJaringanJalan.renderer = getRendererJaringanJalan("los_sebelum");
    } else {
      layerBangunan.renderer = getRendererBangunan("itbx", "jlh_lantai");
      layerPolaRuang.renderer = getRendererPolaRuang("namaszona");
      layerKapasitasAir.renderer = getRendererKapasitasAir("izin_air");
      layerJaringanJalan.renderer = getRendererJaringanJalan("los");
    }
    layerBangunan.refresh();
    layerPolaRuang.refresh();
    layerKapasitasAir.refresh();
    layerJaringanJalan.refresh();
    setActiveSebelumSesudah({
      ...activeSebelumSesudah,
      activeSebelum: !activeSebelumSesudah.activeSebelum,
    });
  };

  const getRendererBangunan = (itbx, lantai) => {
    return {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      defaultSymbol: getSymbol3D([156, 156, 156]),
      defaultLabel: "Kosong",
      field: itbx,
      uniqueValueInfos: [
        {
          value: "I",
          symbol: getSymbol3D([56, 168, 0]),
          label: "I",
        },
        {
          value: "T/B",
          label: "T/B",
          symbol: getSymbol3D([245, 202, 122]),
        },
        {
          value: "X",
          label: "X",
          symbol: getSymbol3D([230, 0, 0]),
        },
      ],
      visualVariables: [
        {
          type: "size",
          field: lantai,
          valueUnit: "meters", // Converts and extrudes all data values in meters
        },
      ],
    };
  };

  const getRendererPolaRuang = (namaszona) => {
    return {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      defaultSymbol: getSymbol3D("#828282"),
      defaultLabel: "Nama Sub-Zona",
      field: namaszona,
      uniqueValueInfos: [
        {
          value: "Badan Air",
          symbol: getSymbol3D("#73dfff"),
          label: "Badan Air",
        },
        {
          value: "Badan Jalan",
          symbol: getSymbol3D("#ffffff"),
          label: "Badan Jalan",
        },
        {
          value: "Cagar Alam",
          symbol: getSymbol3D("#cfedfc"),
          label: "Cagar Alam",
        },
        {
          value: "Ekosistem Mangrove",
          symbol: getSymbol3D("#43756e"),
          label: "Ekosistem Mangrove",
        },
        {
          value: "Gerakan Tanah",
          symbol: getSymbol3D("#cfedfc"),
          label: "Gerakan Tanah",
        },
        {
          value: "Hortikultura",
          symbol: getSymbol3D("#cfedfc"),
          label: "Hortikultura",
        },
        {
          value: "Hutan Lindung",
          symbol: getSymbol3D("#245724"),
          label: "Hutan Lindung",
        },
        {
          value: "Hutan Produksi Terbatas",
          symbol: getSymbol3D("#b3e6e6"),
          label: "Hutan Produksi Terbatas",
        },
        {
          value: "Hutan Produksi Tetap",
          symbol: getSymbol3D("#99f2cc"),
          label: "Hutan Produksi Tetap",
        },
        {
          value: "Hutan Produksi yang Dapat Dikonversi",
          symbol: getSymbol3D("#fcb3f4"),
          label: "Hutan Produksi yang Dapat Dikonversi",
        },
        {
          value: "Instalasi Pengolahan Air Limbah (IPAL)",
          symbol: getSymbol3D("#c7cba2"),
          label: "Instalasi Pengolahan Air Limbah (IPAL)",
        },
        {
          value: "Instalasi Pengolahan Air Minum (IPAM)",
          symbol: getSymbol3D("#fcb3f4"),
          label: "Instalasi Pengolahan Air Minum (IPAM)",
        },
        {
          value: "Kawasan Industri",
          symbol: getSymbol3D("#fcb3f4"),
          label: "Kawasan Industri",
        },
        {
          value: "Kawasan Peruntukan Industri",
          symbol: getSymbol3D("#adbac9"),
          label: "Kawasan Peruntukan Industri",
        },
        {
          value: "Keunikan Batuan dan Fosil",
          symbol: getSymbol3D("#fcfbb3"),
          label: "Keunikan Batuan dan Fosil",
        },
        {
          value: "Keunikan Bentang Alam",
          symbol: getSymbol3D("#fcfbb3"),
          label: "Keunikan Bentang Alam",
        },
        {
          value: "Keunikan Proses Geologi",
          symbol: getSymbol3D("#fcfbb3"),
          label: "Keunikan Proses Geologi",
        },
        {
          value: "Letusan Gunung Api",
          symbol: getSymbol3D("#fcbeb6"),
          label: "Letusan Gunung Api",
        },
        {
          value: "Lindung Gambut",
          symbol: getSymbol3D("#fcbeb6"),
          label: "Lindung Gambut",
        },
        {
          value: "Lindung Spiritual dan Kearifan Lokal",
          symbol: getSymbol3D("#b8fcd2"),
          label: "Lindung Spiritual dan Kearifan Lokal",
        },
        {
          value: "Pemakaman",
          symbol: getSymbol3D("#e5f4d5"),
          label: "Pemakaman",
        },
        {
          value: "Pembangkitan Tenaga Listrik",
          symbol: getSymbol3D("#ffc000"),
          label: "Pembangkitan Tenaga Listrik",
        },
        {
          value: "Pengembangan Nuklir",
          symbol: getSymbol3D("#b8fcd2"),
          label: "Pengembangan Nuklir",
        },
        {
          value: "Perdagangan dan Jasa Skala BWP",
          symbol: getSymbol3D("#ff8080"),
          label: "Perdagangan dan Jasa Skala BWP",
        },
        {
          value: "Perdagangan dan Jasa Skala Kota",
          symbol: getSymbol3D("#ff6666"),
          label: "Perdagangan dan Jasa Skala Kota",
        },
        {
          value: "Perdagangan dan Jasa Skala Sub BWP",
          symbol: getSymbol3D("#ff9999"),
          label: "Perdagangan dan Jasa Skala Sub BWP",
        },
        {
          value: "Pergudangan",
          symbol: getSymbol3D([199, 203, 163]),
          label: "Pergudangan",
        },
        {
          value: "Perikanan Budidaya",
          symbol: getSymbol3D([97, 145, 201]),
          label: "Perikanan Budidaya",
        },
        {
          value: "Perikanan Tangkap",
          symbol: getSymbol3D([184, 252, 210]),
          label: "Perikanan Tangkap",
        },
        {
          value: "Perkantoran",
          symbol: getSymbol3D([200, 20, 150]),
          label: "Perkantoran",
        },
        {
          value: "Perkebunan",
          symbol: getSymbol3D([122, 183, 77]),
          label: "Perkebunan",
        },
        {
          value: "Perkebunan Rakyat",
          symbol: getSymbol3D([179, 188, 252]),
          label: "Perkebunan Rakyat",
        },
        {
          value: "Pertahanan dan Keamanan",
          symbol: getSymbol3D([115, 138, 69]),
          label: "Pertahanan dan Keamanan",
        },
        {
          value: "Pertambangan",
          symbol: getSymbol3D([179, 188, 252]),
          label: "Pertambangan",
        },
        {
          value: "Perumahan dan Perdagangan/Jasa",
          symbol: getSymbol3D([230, 152, 0]),
          label: "Perumahan dan Perdagangan/Jasa",
        },
        {
          value: "Perumahan dan Perkantoran",
          symbol: getSymbol3D([179, 188, 252]),
          label: "Perumahan dan Perkantoran",
        },
        {
          value: "Perumahan, Perdagangan/Jasa dan Perkantoran",
          symbol: getSymbol3D([252, 230, 197]),
          label: "Perumahan, Perdagangan/Jasa dan Perkantoran",
        },
        {
          value: "Peternakan",
          symbol: getSymbol3D([252, 230, 197]),
          label: "Peternakan",
        },
        {
          value: "Pos Lintas Batas Negara",
          symbol: getSymbol3D([252, 230, 197]),
          label: "Pos Lintas Batas Negara",
        },
        {
          value: "Resapan Air",
          symbol: getSymbol3D([232, 255, 224]),
          label: "Resapan Air",
        },
        {
          value: "Rimba Kota",
          symbol: getSymbol3D([219, 255, 214]),
          label: "Rimba Kota",
        },
        {
          value: "Ruang Terbuka Non Hijau",
          symbol: getSymbol3D([238, 215, 252]),
          label: "Ruang Terbuka Non Hijau",
        },
        {
          value: "Rumah Kepadatan Rendah",
          symbol: getSymbol3D([255, 255, 191]),
          label: "Rumah Kepadatan Rendah",
        },
        {
          value: "Rumah Kepadatan Sangat Rendah",
          symbol: getSymbol3D([238, 215, 252]),
          label: "Rumah Kepadatan Sangat Rendah",
        },
        {
          value: "Rumah Kepadatan Sangat Tinggi",
          symbol: getSymbol3D([255, 255, 77]),
          label: "Rumah Kepadatan Sangat Tinggi",
        },
        {
          value: "Rumah Kepadatan Sedang",
          symbol: getSymbol3D([255, 255, 153]),
          label: "Rumah Kepadatan Sedang",
        },
        {
          value: "Rumah Kepadatan Tinggi",
          symbol: getSymbol3D([255, 255, 115]),
          label: "Rumah Kepadatan Tinggi",
        },
        {
          value: "SPU Pendidikan Skala Kecamatan",
          symbol: getSymbol3D([230, 0, 169]),
          label: "SPU Pendidikan Skala Kecamatan",
        },
        {
          value: "Sekitar Danau Atau Waduk",
          symbol: getSymbol3D([252, 215, 227]),
          label: "Sekitar Danau Atau Waduk",
        },
        {
          value: "Sekitar Mata Air",
          symbol: getSymbol3D([168, 255, 191]),
          label: "Sekitar Mata Air",
        },
        {
          value: "Sektor Informal",
          symbol: getSymbol3D([255, 102, 0]),
          label: "Sektor Informal",
        },
        {
          value: "Sempadan Pantai",
          symbol: getSymbol3D([204, 255, 204]),
          label: "Sempadan Pantai",
        },
        {
          value: "Sempadan Patahan Aktif",
          symbol: getSymbol3D([252, 215, 227]),
          label: "Sempadan Patahan Aktif",
        },
        {
          value: "Sentra Industri Kecil dan Menengah",
          symbol: getSymbol3D([252, 215, 227]),
          label: "Sentra Industri Kecil dan Menengah",
        },
        {
          value: "Suaka Margasatwa",
          symbol: getSymbol3D([201, 252, 182]),
          label: "Suaka Margasatwa",
        },
        {
          value: "Taman Buru",
          symbol: getSymbol3D([201, 252, 182]),
          label: "Taman Buru",
        },
        {
          value: "Taman Hutan Raya",
          symbol: getSymbol3D([194, 212, 252]),
          label: "Taman Hutan Raya",
        },
        {
          value: "Taman Kecamatan",
          symbol: getSymbol3D([141, 255, 7]),
          label: "Taman Kecamatan",
        },
        {
          value: "Taman Kelurahan",
          symbol: getSymbol3D([166, 255, 61]),
          label: "Taman Kelurahan",
        },
        {
          value: "Taman Kota",
          symbol: getSymbol3D([166, 255, 61]),
          label: "Taman Kota",
        },
        {
          value: "Taman Nasional",
          symbol: getSymbol3D([194, 212, 252]),
          label: "Taman Nasional",
        },
        {
          value: "Taman RT",
          symbol: getSymbol3D([194, 212, 252]),
          label: "Taman RT",
        },
        {
          value: "Taman RW",
          symbol: getSymbol3D([153, 255, 50]),
          label: "Taman RW",
        },
        {
          value: "Taman Wisata Alam",
          symbol: getSymbol3D([228, 192, 252]),
          label: "Taman Wisata Alam",
        },
        {
          value: "Tanaman Pangan",
          symbol: getSymbol3D([228, 192, 252]),
          label: "Tanaman Pangan",
        },
        {
          value: "Tempat Evakuasi Akhir",
          symbol: getSymbol3D([228, 192, 252]),
          label: "Tempat Evakuasi Akhir",
        },
        {
          value: "Tempat Evakuasi Sementara",
          symbol: getSymbol3D([212, 252, 231]),
          label: "Tempat Evakuasi Sementara",
        },
        {
          value: "Tempat Pemrosesan Akhir",
          symbol: getSymbol3D([230, 230, 0]),
          label: "Tempat Pemrosesan Akhir",
        },
        {
          value: "Transportasi",
          symbol: getSymbol3D([255, 40, 50]),
          label: "Transportasi",
        },
        {
          value: "Wisata Alam",
          symbol: getSymbol3D([255, 230, 255]),
          label: "Wisata Alam",
        },
        {
          value: "Wisata Buatan",
          symbol: getSymbol3D([255, 230, 255]),
          label: "Wisata Buatan",
        },
        {
          value: "Wisata Budaya",
          symbol: getSymbol3D([212, 252, 231]),
          label: "Wisata Budaya",
        },
        {
          value: "Zona Penyangga",
          symbol: getSymbol3D([138, 255, 204]),
          label: "Zona Penyangga",
        },
      ],
    };
  };

  const getRendererKapasitasAir = (field) => {
    return {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      // defaultSymbol: getSymbol3D([130, 130, 130]),
      // defaultLabel: "",
      field: field,
      fieldDelimiter: ",",
      scaleSymbols: true,
      transparency: 30,
      uniqueValueInfos: [
        {
          value: "Surplus",
          label: "Surplus",
          symbol: getSymbol3D([115, 223, 255]),
        },
        {
          value: "Defisit",
          label: "Defisit",
          symbol: getSymbol3D([130, 130, 130]),
        },
        // {
        //   value: "Pembangunan Sudah Maksimal",
        //   label: "Pembangunan Sudah Maksimal",
        //   symbol: getSymbol3D([165, 245, 122]),
        // },
      ],
    };
  };

  const getRendererJaringanJalan = (field) => {
    return {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      defaultSymbol: getLine3D([130, 130, 130]),
      defaultLabel: "Lainnya",
      field: field,
      fieldDelimiter: ",",
      scaleSymbols: true,
      transparency: 0,
      uniqueValueInfos: [
        {
          value: "Masih Bisa Dibangun",
          label: "Masih Bisa Dibangun",
          symbol: getLine3D([115, 223, 255]),
        },
        {
          value: "A",
          label: "A",
          symbol: getLine3D([56, 168, 0]),
        },
        {
          value: "B",
          label: "B",
          symbol: getLine3D([112, 168, 0]),
        },
        {
          value: "C",
          label: "C",
          symbol: getLine3D([230, 230, 0]),
        },
        {
          value: "D",
          label: "D",
          symbol: getLine3D([255, 170, 0]),
        },
        {
          value: "E",
          label: "E",
          symbol: getLine3D([255, 85, 0]),
        },
        {
          value: "F",
          label: "F",
          symbol: getLine3D([168, 0, 0]),
        },
      ],
    };
  };

  const getSymbol3D = (color) => {
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
  };

  const getLine3D = (color) => {
    return {
      type: "line-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "line", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: color,
          },
          size: 4,
          cap: "round",
          join: "round",
        },
      ],
    };
  };

  const handleActivateSegmentation = () => {
    !isSegmentationActive
      ? showSegmentationFunc(segmentationBuildingId)
      : removeSegmentationFunc();
    setIsSegmentationActive(!isSegmentationActive);
    !isSegmentationActive && document.getElementById("segmentationLegendCard")
      ? (document.getElementById("segmentationLegendCard").style.display =
          "block")
      : (document.getElementById("segmentationLegendCard").style.display =
          "none");
  };

  // start history analysis
  const handleHistoryAnalysis = () => {
    console.log(dataHistory);
    handleExecuteSpCopy(1);
    // if (
    //   dataHistory.id_bangunan
    // ) {
    //   Swal.fire("Belum diimplementasikan", "Menunggu servis backend", "info")
    // } else {
    //   Swal.fire(
    //     "Maaf",
    //     "Pilih bangunan terlebih dahulu untuk mencetak analisis sejarah simulasi",
    //     "error"
    //   );
    // }
  };
  // end history analysis

  const handleExecuteSpCopy = (param) => {
    axios
      .post(
        config.url.API_URL + "/Simulasi/ExecuteSpCopy",
        {},
        {
          headers: { Authorization: "Bearer " + sessionStorage.token },
          params: {
            simulasiId: state?.simulasiBangunan?.simulasiId,
            simulasiIdBaru: state?.id,
            projectId: state?.simulasiBangunan?.projectId,
            dataKe: state?.simulasiBangunan?.dataKe,
            param: param,
          },
        }
      )
      .then((data) => {});
  };

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
              <LoadingOverlay
                active={true}
                spinner
                text="Menjalankan analisis..."
              ></LoadingOverlay>
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
                  /* minHeight: "100%", */
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
                {showingPopup.title === "Bangunan" ? (
                  <>
                    {/* start popup sebelumsesudah */}
                    <div className="switch-sebelum-sesudah">
                      <div className="switch-button">
                        <input
                          className="switch-button-checkbox"
                          type="checkbox"
                          onClick={handleSebelumSesudah}
                        />
                        <label
                          className="switch-button-label"
                          style={{ marginBottom: "0px" }}
                        >
                          <span className="switch-button-label-span">
                            Sesudah
                          </span>
                        </label>
                      </div>

                      <div className="segementation-container">
                        Tampilkan Layer Segmentasi
                        <div className="switch-button-small">
                          <input
                            className="switch-button-small-checkbox"
                            type="checkbox"
                            onChange={handleActivateSegmentation}
                            checked={isSegmentationActive}
                          />
                          <label
                            className="switch-button-small-label"
                            style={{ marginBottom: "0px" }}
                          >
                            <span className="switch-button-small-label-span"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        height: "calc(100vh - 200px)",
                        overflow: "auto",
                      }}
                    >
                      <div
                        className="accordion accordion-bordered"
                        id="accordionExample"
                      >
                        <div className="fade-in">
                          <div
                            className="card"
                            id="segmentationLegendCard"
                            style={{ display: "none", margin: "0 0.2rem" }}
                          >
                            <div
                              className="card-header"
                              role="tab"
                              id="headingTwo"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left collapsed btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#segmentationLegend"}
                                  aria-expanded="true"
                                  aria-controls={"segmentationLegend"}
                                  style={{ fontSize: "14px" }}
                                >
                                  {/* <img
                                  src="./images/water.svg"
                                  alt="Air Bersih"
                                  style={{ marginRight: "10px", width: "16px" }}
                                /> */}
                                  <i className="ti-info"> </i>
                                  Legenda Segmentasi
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="segmentationLegend"
                              className="collapse"
                              aria-labelledby="segmentationLegend"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <img
                                  src={segmentationLegend}
                                  alt="Legenda Segmentasi"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ margin: "0 0.2rem" }}>
                            <div
                              className="card-header"
                              role="tab"
                              id="headingThree"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left collapsed btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#itbxSum"}
                                  aria-expanded="true"
                                  aria-controls={"itbxSum"}
                                  style={{ fontSize: "14px" }}
                                >
                                  <i className="ti-info"> </i>
                                  Penjelasan ITBX{" "}
                                  {!itbxSum && (
                                    <div
                                      className="spinner-border spinner-border-sm text-primary"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                  )}
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="itbxSum"
                              className="collapse"
                              aria-labelledby="headingThree"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                {itbxSum && (
                                  <table className="table">
                                    <tbody>
                                      {itbxSum.map((itbx) => (
                                        <tr key={itbx.id}>
                                          <td>{itbx.kode}</td>
                                          <td>{itbx.deskripsi}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                                {!itbxSum && (
                                  <div>
                                    <div
                                      className="spinner-grow spinner-grow-sm text-primary"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                    <div
                                      className="spinner-grow spinner-grow-sm text-secondary"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                    <div
                                      className="spinner-grow spinner-grow-sm text-success"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                    <div
                                      className="spinner-grow spinner-grow-sm text-danger"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                    <div
                                      className="spinner-grow spinner-grow-sm text-warning"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                    <div
                                      className="spinner-grow spinner-grow-sm text-info"
                                      role="status"
                                    >
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ margin: "0 0.2rem" }}>
                            <div
                              className="card-header"
                              role="tab"
                              id="headingTwo"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left collapsed btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#sebelumSum"}
                                  aria-expanded="false"
                                  aria-controls={"sebelumSum"}
                                  style={{ fontSize: "14px" }}
                                >
                                  {/* <img
                                  src="./images/Traffic-lights.svg"
                                  alt="Kemacetan"
                                  style={{ marginRight: "10px" }}
                                /> */}
                                  <i className="ti-info-alt"> </i>
                                  Ringkasan
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="sebelumSum"
                              className="show collapse"
                              aria-labelledby="headingTwo"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>Status ITBX</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[72]
                                              .field_value
                                          : contentBangunanKdbKlb[73]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KBLI</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[76]
                                              .field_value
                                          : contentBangunanKdbKlb[77]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Jenis Kegiatan (KBLI)</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[74]
                                              .field_value
                                          : contentBangunanKdbKlb[75]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Jenis Bangunan</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[78]
                                              .field_value
                                          : contentBangunanKdbKlb[1]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Nama Sub Zona</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[67]
                                              .field_value
                                          : contentBangunanKdbKlb[60]
                                              .field_value}
                                      </td>
                                    </tr>
                                    {
                                      /* (String(contentBangunanKdbKlb[2].field_value).toLowerCase().indexOf("ditolak") !== -1 || String(contentBangunanKdbKlb[3].field_value).toLowerCase().indexOf("ditolak") !== -1) &&  */ <tr>
                                        <td>Status KDB/KLB</td>
                                        <td>
                                          {activeSebelumSesudah.activeSebelum
                                            ? contentBangunanKdbKlb[2]
                                                .field_value
                                            : contentBangunanKdbKlb[3]
                                                .field_value}
                                        </td>
                                      </tr>
                                    }
                                    {
                                      /* (String(contentBangunanKdbKlb[10].field_value).toLowerCase().indexOf("ditolak") !== -1 || String(contentBangunanKdbKlb[11].field_value).toLowerCase().indexOf("ditolak") !== -1) && */ <tr>
                                        <td>Status Tingkat Kemacetan</td>
                                        <td>
                                          {activeSebelumSesudah.activeSebelum
                                            ? contentBangunanKdbKlb[10]
                                                .field_value
                                            : contentBangunanKdbKlb[11]
                                                .field_value}
                                        </td>
                                        {/* <td>{!activeSebelumSesudah.activeSebelum ? hasilSimulasiBangunanKemacetan : hasilSimulasiBangunanKemacetan}</td> */}
                                        {/* <td>{!activeSebelumSesudah.activeSebelum ? contentBangunanKemacetan[10].field_value : contentBangunanKemacetan[11].field_value}</td> */}
                                      </tr>
                                    }
                                    {
                                      /* (String(contentBangunanKdbKlb[8].field_value).toLowerCase().indexOf("ditolak") !== -1 || String(contentBangunanKdbKlb[9].field_value).toLowerCase().indexOf("ditolak") !== -1) &&  */ <tr>
                                        <td>Status Kuantitas Air Bersih</td>
                                        <td>
                                          {activeSebelumSesudah.activeSebelum
                                            ? contentBangunanKdbKlb[8]
                                                .field_value
                                            : contentBangunanKdbKlb[9]
                                                .field_value}
                                        </td>
                                        {/* <td>{!activeSebelumSesudah.activeSebelum ? contentBangunanAirBersih[8].field_value : contentBangunanAirBersih[9].field_value}</td> */}
                                      </tr>
                                    }
                                    {
                                      /* (String(contentBangunanKdbKlb[8].field_value).toLowerCase().indexOf("ditolak") !== -1 || String(contentBangunanKdbKlb[9].field_value).toLowerCase().indexOf("ditolak") !== -1) &&  */ <tr>
                                        <td>Status Tingkat Persampahan</td>
                                        <td>
                                          {activeSebelumSesudah.activeSebelum
                                            ? contentBangunanKdbKlb[85]
                                                .field_value
                                            : contentBangunanKdbKlb[85]
                                                .field_value}
                                        </td>
                                        {/* <td>{!activeSebelumSesudah.activeSebelum ? contentBangunanAirBersih[8].field_value : contentBangunanAirBersih[9].field_value}</td> */}
                                      </tr>
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ margin: "0 0.2rem" }}>
                            <div
                              className="card-header"
                              role="tab"
                              id="headingOne"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#sebelum"}
                                  aria-expanded="true"
                                  aria-controls={"sebelum"}
                                  style={{ fontSize: "14px" }}
                                >
                                  <img
                                    src="./images/office-building.svg"
                                    alt="KDB/KLB"
                                    style={{
                                      marginRight: "10px",
                                      width: "16px",
                                    }}
                                  />
                                  KDB/KLB
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="sebelum"
                              className="collapse"
                              aria-labelledby="headingOne"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>Status KDB/KLB</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[2].field_value
                                          : contentBangunanKdbKlb[3]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Jenis Bangunan</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[78]
                                              .field_value
                                          : contentBangunanKdbKlb[1]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Nama Sub Zona</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[67]
                                              .field_value
                                          : contentBangunanKdbKlb[60]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? "Jumlah Lantai"
                                          : "Jumlah Lantai Saat Ini"}
                                      </td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[16]
                                              .field_value
                                          : contentBangunanKdbKlb[17]
                                              .field_value}{" "}
                                        lantai
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        Jumlah Lantai Maksimum yang
                                        Diperbolehkan
                                      </td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[71]
                                              .field_value
                                          : contentBangunanKdbKlb[61]
                                              .field_value}{" "}
                                        lantai
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Luas Tapak{" "}
                                        (m<sup>2</sup>)</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[18]
                                              .field_value
                                            ? contentBangunanKdbKlb[18].field_value.toFixed(
                                                2
                                              )
                                            : contentBangunanKdbKlb[18]
                                                .field_value
                                          : contentBangunanKdbKlb[19]
                                              .field_value
                                          ? contentBangunanKdbKlb[19].field_value.toFixed(
                                              2
                                            )
                                          : contentBangunanKdbKlb[19]
                                              .field_value}{" "}
                                        m<sup>2</sup>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? "Jumlah Bangunan"
                                          : "Jumlah Bangunan Saat Ini"}{" "}
                                        (m<sup>2</sup>)
                                      </td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[20]
                                              .field_value
                                            ? contentBangunanKdbKlb[20].field_value.toFixed(
                                                2
                                              )
                                            : contentBangunanKdbKlb[20]
                                                .field_value
                                          : contentBangunanKdbKlb[21]
                                              .field_value
                                          ? contentBangunanKdbKlb[21].field_value.toFixed(
                                              2
                                            )
                                          : contentBangunanKdbKlb[21]
                                              .field_value}{" "}
                                        m<sup>2</sup>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        Luas Bangunan Maksimum yang
                                        Diperbolehkan (m<sup>2</sup>)
                                      </td>
                                      <td>
                                        {contentBangunanKdbKlb[65].field_value
                                          ? contentBangunanKdbKlb[65].field_value.toFixed(
                                              2
                                            )
                                          : contentBangunanKdbKlb[65]
                                              .field_value}{" "}
                                        m<sup>2</sup>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KDB Maksimal (Hasil Analisis)</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[68]
                                              .field_value
                                            ? contentBangunanKdbKlb[68].field_value.toFixed(
                                                4
                                              )
                                            : contentBangunanKdbKlb[68]
                                                .field_value
                                          : contentBangunanKdbKlb[62]
                                              .field_value
                                          ? contentBangunanKdbKlb[62].field_value.toFixed(
                                              4
                                            )
                                          : contentBangunanKdbKlb[62]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KDB Maksimal Sesuai RDTR</td>
                                      <td>
                                        {contentBangunanKdbKlb[80].field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KLB Maksimal (Hasil Analisis)</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[69]
                                              .field_value
                                          : contentBangunanKdbKlb[63]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KLB Maksimal Sesuai RDTR</td>
                                      <td>
                                        {contentBangunanKdbKlb[81].field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KDH Minimal (Hasil Analisis)</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[70]
                                              .field_value
                                            ? contentBangunanKdbKlb[70].field_value.toFixed(
                                                4
                                              )
                                            : contentBangunanKdbKlb[70]
                                                .field_value
                                          : contentBangunanKdbKlb[64]
                                              .field_value
                                          ? contentBangunanKdbKlb[64].field_value.toFixed(
                                              4
                                            )
                                          : contentBangunanKdbKlb[64]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>KDH Minimal Sesuai RDTR</td>
                                      <td>
                                        {contentBangunanKdbKlb[82].field_value}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ margin: "0 0.2rem" }}>
                            <div
                              className="card-header"
                              role="tab"
                              id="headingTwo"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left collapsed btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#sebelumDua"}
                                  aria-expanded="true"
                                  aria-controls={"sebelumDua"}
                                  style={{ fontSize: "14px" }}
                                >
                                  <img
                                    src="./images/Traffic-lights.svg"
                                    alt="Kemacetan"
                                    style={{
                                      marginRight: "10px",
                                      width: "16px",
                                      height: "16px",
                                    }}
                                  />
                                  Kemacetan
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="sebelumDua"
                              className="collapse"
                              aria-labelledby="headingTwo"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>Status Tingkat Kemacetan</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[10]
                                              .field_value
                                          : contentBangunanKdbKlb[11]
                                              .field_value}
                                      </td>
                                      {/* <td>{!activeSebelumSesudah.activeSebelum ? hasilSimulasiBangunanKemacetan : hasilSimulasiBangunanKemacetan}</td> */}
                                      {/* <td>{!activeSebelumSesudah.activeSebelum ? contentBangunanKemacetan[10].field_value : contentBangunanKemacetan[11].field_value}</td> */}
                                    </tr>
                                    {/* <tr>
                                    <td>Jenis Bangunan</td>
                                    <td>
                                      {contentBangunanKdbKlb[1].field_value}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Nama Sub Zona</td>
                                    <td>
                                    {activeSebelumSesudah.activeSebelum
                                        ? contentBangunanKdbKlb[67].field_value
                                        : contentBangunanKdbKlb[60]
                                            .field_value}
                                    </td>
                                  </tr> */}
                                    <tr>
                                      <td>LOS</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[14]
                                              .field_value
                                          : contentBangunanKdbKlb[15]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>LOS Num</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[12]
                                              .field_value
                                          : contentBangunanKdbKlb[13]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Arus</td>
                                      <td>
                                        {/* {contentBangunanKdbKlb[66].field_value} */}
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[79]
                                              .field_value
                                          : contentBangunanKdbKlb[66]
                                              .field_value}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Kapasitas</td>
                                      <td>
                                        {contentBangunanKdbKlb[52].field_value}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ margin: "0 0.2rem" }}>
                            <div
                              className="card-header"
                              role="tab"
                              id="headingThree"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left collapsed btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#sebelumTiga"}
                                  aria-expanded="true"
                                  aria-controls={"sebelumTiga"}
                                  style={{ fontSize: "14px" }}
                                >
                                  <img
                                    src="./images/water.svg"
                                    alt="Air Bersih"
                                    style={{
                                      marginRight: "10px",
                                      width: "16px",
                                    }}
                                  />
                                  Air Bersih
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="sebelumTiga"
                              className="collapse"
                              aria-labelledby="headingThree"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>Status Kuantitas Air Bersih</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[8].field_value
                                          : contentBangunanKdbKlb[9]
                                              .field_value}
                                      </td>
                                      {/* <td>{!activeSebelumSesudah.activeSebelum ? contentBangunanAirBersih[8].field_value : contentBangunanAirBersih[9].field_value}</td> */}
                                    </tr>
                                    {/* <tr>
                                    <td>Jenis Bangunan</td>
                                    <td>
                                      {contentBangunanKdbKlb[1].field_value}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Nama Sub Zona</td>
                                    <td>
                                    {activeSebelumSesudah.activeSebelum
                                        ? contentBangunanKdbKlb[67].field_value
                                        : contentBangunanKdbKlb[60]
                                            .field_value}
                                    </td>
                                  </tr> */}
                                    <tr>
                                      <td>Kebutuhan Air Harian</td>
                                      <td>
                                        {/* {contentBangunanKdbKlb[37].field_value} */}
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[83]
                                              .field_value
                                          : contentBangunanKdbKlb[37]
                                              .field_value}{" "}
                                        liter/hari
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Ketersediaan Air PDAM Harian</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[84]
                                              .field_value
                                          : contentBangunanKdbKlb[36]
                                              .field_value}{" "}
                                        liter/hari
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ margin: "0 0.2rem" }}>
                            <div
                              className="card-header"
                              role="tab"
                              id="headingFour"
                              style={{ padding: "0px" }}
                            >
                              <h6 className="mb-0">
                                <button
                                  className="btn btn-block text-left collapsed btn-sm"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={"#sebelumEmpat"}
                                  aria-expanded="true"
                                  aria-controls={"sebelumEmpat"}
                                  style={{ fontSize: "14px" }}
                                >
                                  <img
                                    src="./images/recycling.png"
                                    alt="Sampah"
                                    style={{
                                      marginRight: "10px",
                                      width: "16px",
                                    }}
                                  />
                                  Persampahan
                                  <i className="ti-arrow-circle-down float-right"></i>
                                </button>
                              </h6>
                            </div>

                            <div
                              id="sebelumEmpat"
                              className="collapse"
                              aria-labelledby="headingFour"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <td>Status Tingkat Persampahan</td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[85].field_value
                                          : contentBangunanKdbKlb[85]
                                              .field_value}
                                      </td>
                                      {/* <td>{!activeSebelumSesudah.activeSebelum ? contentBangunanAirBersih[8].field_value : contentBangunanAirBersih[9].field_value}</td> */}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                    {/* end popup sebelumsesudah */}
                  </>
                ) : (
                  <div
                    className="table-responsive"
                    style={{
                      position: "absolute",
                      height: "calc(100% - 50px)",
                      overflow: "auto",
                    }}
                  >
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
              <div
                className="esri-component esri-widget"
                style={{ background: "#fff", width: "300px" }}
              >
                <form
                  className="esri-feature-form__form"
                  style={{ padding: "5px" }}
                >
                  {selectBuildings && (
                    <div>
                      <label className="esri-feature-form__label">
                        Pilih Bangunan
                      </label>
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
                  <input
                    name="inputX"
                    id="inputX"
                    type="hidden"
                    defaultValue={inputX === 0 ? 0 : inputX}
                  />
                  <input
                    name="inputY"
                    id="inputY"
                    type="hidden"
                    defaultValue={inputY === 0 ? 0 : inputY}
                  />
                </form>
              </div>
            </div>
            <div id="historyExpDiv" className="esri-widget print">
              <div
                style={{
                  backgroundColor: "#fff",
                  paddingTop: "10px",
                  textAlign: "center",
                }}
              >
                <h3 className="esri-widget__heading">Sejarah Simulasi</h3>
              </div>
              {
                <div
                  className=""
                  style={{
                    background: "#f3f3f3",
                    width: "300px",
                    maxHeight: "180px",
                    overflowX: "auto",
                    padding: "0px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fff",
                      margin: "5px",
                      padding: "10px",
                    }}
                  >
                    <p>
                      Sistem akan menggandakan untuk membuat history yang dapat
                      dianalisis
                    </p>
                    {/* <p>Bangunan yang Akan Dianalisis</p>
                  <p id="id_bangunan_history">
                    ID Bangunan: Belum ada yang dipilih
                  </p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    id="pilih_bangunan_history"
                    type="button"
                    title="Pilih Bangunan"
                    style={{
                      marginTop: "5px",
                      marginBottom: "5px",
                      marginRight: "2px",
                    }}
                  >
                    Pilih Bangunan
                  </button> */}
                  </div>
                </div>
              }
              <button
                className="btn btn-primary btn-block btn-icon-text rounded-0"
                id="history_simulasi"
                type="button"
                title="Analisis Sejarah Simulasi"
                onClick={() => handleHistoryAnalysis()}
              >
                <i className="ti-search btn-icon-prepend"></i>
                Analisis Sejarah Simulasi
              </button>
            </div>
            <div id="printExpDiv" className="esri-widget print">
              <div
                style={{
                  backgroundColor: "#fff",
                  paddingTop: "10px",
                  textAlign: "center",
                }}
              >
                <h3 className="esri-widget__heading">Hasil Simulasi</h3>
              </div>
              <div
                className=""
                style={{
                  background: "#f3f3f3",
                  width: "300px",
                  maxHeight: "180px",
                  overflowX: "auto",
                  padding: "0px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Bangunan Optimum (sebelum)</p>
                  <img
                    id="photo_pembangunan_optimum_sebelum"
                    style={{ display: "none" }}
                    alt="bangunan optimum sebelum"
                    src={dataScreenshot.photo.pembangunan_optimum_sebelum}
                  />
                  {
                    <button
                      className="btn btn-outline-primary btn-sm screenshot"
                      id="pembangunan_optimum_sebelum"
                      type="button"
                      title="Ambil Tangkapan Layar"
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                        marginRight: "2px",
                      }}
                    >
                      Ambil Tangkapan Layar
                    </button>
                  }
                </div>
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Bangunan Optimum (sesudah)</p>
                  <img
                    id="photo_pembangunan_optimum_sesudah"
                    style={{ display: "none" }}
                    alt="bangunan optimum sesudah"
                    src={dataScreenshot.photo.pembangunan_optimum_sesudah}
                  />
                  {
                    <button
                      className="btn btn-outline-primary btn-sm screenshot"
                      id="pembangunan_optimum_sesudah"
                      type="button"
                      title="Ambil Tangkapan Layar"
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                        marginRight: "2px",
                      }}
                    >
                      Ambil Tangkapan Layar
                    </button>
                  }
                </div>
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Kemacetan (sebelum)</p>
                  <img
                    id="photo_kemacetan_sebelum"
                    style={{ display: "none" }}
                    alt="bangunan optimum sebelum"
                    src={dataScreenshot.photo.kemacetan_sebelum}
                  />
                  {
                    <button
                      className="btn btn-outline-primary btn-sm screenshot"
                      id="kemacetan_sebelum"
                      type="button"
                      title="Ambil Tangkapan Layar"
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                        marginRight: "2px",
                      }}
                    >
                      Ambil Tangkapan Layar
                    </button>
                  }
                </div>
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Kemacetan (sesudah)</p>
                  <img
                    id="photo_kemacetan_sesudah"
                    style={{ display: "none" }}
                    alt="bangunan optimum sebelum"
                    src={dataScreenshot.photo.kemacetan_sesudah}
                  />
                  {
                    <button
                      className="btn btn-outline-primary btn-sm screenshot"
                      id="kemacetan_sesudah"
                      type="button"
                      title="Ambil Tangkapan Layar"
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                        marginRight: "2px",
                      }}
                    >
                      Ambil Tangkapan Layar
                    </button>
                  }
                </div>
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Air Bersih (sebelum)</p>
                  <img
                    id="photo_air_bersih_sebelum"
                    style={{ display: "none" }}
                    alt="bangunan optimum sebelum"
                    src={dataScreenshot.photo.air_bersih_sebelum}
                  />
                  {
                    <button
                      className="btn btn-outline-primary btn-sm screenshot"
                      id="air_bersih_sebelum"
                      type="button"
                      title="Ambil Tangkapan Layar"
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                        marginRight: "2px",
                      }}
                    >
                      Ambil Tangkapan Layar
                    </button>
                  }
                </div>
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Air Bersih (sesudah)</p>
                  <img
                    id="photo_air_bersih_sesudah"
                    style={{ display: "none" }}
                    alt="bangunan optimum sebelum"
                    src={dataScreenshot.photo.air_bersih_sesudah}
                  />
                  {
                    <button
                      className="btn btn-outline-primary btn-sm screenshot"
                      id="air_bersih_sesudah"
                      type="button"
                      title="Ambil Tangkapan Layar"
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                        marginRight: "2px",
                      }}
                    >
                      Ambil Tangkapan Layar
                    </button>
                  }
                </div>
                <div
                  style={{
                    backgroundColor: "#fff",
                    margin: "5px",
                    padding: "10px",
                  }}
                >
                  <p>Bangunan yang Akan Dicetak</p>
                  <p id="id_bangunan_print">
                    ID Bangunan: Belum ada yang dipilih
                  </p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    id="pilih_bangunan_print"
                    type="button"
                    title="Pilih Bangunan"
                    style={{
                      marginTop: "5px",
                      marginBottom: "5px",
                      marginRight: "2px",
                    }}
                  >
                    Pilih Bangunan
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary btn-block btn-icon-text rounded-0"
                id="print_simulasi"
                type="button"
                title="Unduh Hasil Simulasi"
              >
                <i className="ti-download btn-icon-prepend"></i>
                Unduh Hasil Simulasi
              </button>
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
    fallbacks: [
      { width: "-moz-calc(100vh - 110px)" },
      { width: "-webkit-calc(100vh - 110px)" },
      { width: "-o-calc(100vh - 110px)" },
    ],
  },
};

export default SimulasiMap;
