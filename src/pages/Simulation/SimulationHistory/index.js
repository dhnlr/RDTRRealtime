import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory, Link, useLocation } from "react-router-dom";
import Tree, { TreeNode } from 'rc-tree';
import Axios from "axios";

import { Header, Menu, Footer } from "../../../components";
import { config } from "../../../Constants";
import segmentationLegend from "../../SimulasiMap/segmentationLegend.png";


import "./index.css"

import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic"
import Polygon from "@arcgis/core/geometry/Polygon"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import GroupLayer from "@arcgis/core/layers/GroupLayer"
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D"
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer"
import SceneView from "@arcgis/core/views/SceneView";
import Legend from "@arcgis/core/widgets/Legend"
import Expand from "@arcgis/core/widgets/Expand"
import * as watchUtils from "@arcgis/core/core/watchUtils";

function SimulationHistory() {
  const [showingPopup, setShowingPopop] = useState({
    show: false,
    title: "",
  });
  const [contentBangunanKdbKlb, setContentBangunanKdbKlb] = useState([]);
  const [contentGeneral, setContentGeneral] = useState([]);
  const [activeSebelumSesudah, setActiveSebelumSesudah] = useState({
    activeSebelum: false,
  });
  const [stateView, setStateView] = useState(null);
  const [removeSegmentationFunc, setRemoveSegmentationFunc] = useState();
  const [showSegmentationFunc, setShowSegmentationFunc] = useState();
  const [isSegmentationActive, setIsSegmentationActive] = useState(false);
  const [segmentationBuildingId, setSegmentationBuildingId] = useState(null);
  const [itbxSum, setItbxSum] = useState(null);

  let history = useHistory();
  let { state } = useLocation();

  const mapBeforeDiv = useRef(null);
  const mapAfterDiv = useRef(null);
  const legendDiv = useRef(null)
  const layerListDiv = useRef(null)

  let highlight = null

  const treeData = [
    {
      key: '0',
      title: 'Layer Utama',
      children: [
        { key: 'bangunan', title: 'Bangunan'},
        { key: 'jalan', title: 'Jaringan Jalan'},
        { key: 'sampah', title: 'Sampah TPS'},
        { key: 'air', title: 'Kapasitas Air'},
        { key: 'persil', title: 'Persil Tanah'},
      ],
    },
    {
      key: '1',
      title: 'Layer Tambahan',
      children: [
        { key: 'bangunan_amplop', title: 'Bangunan - Amplop'},
        { key: 'bpn', title: 'Persil Tanah - BPN'},
        { key: 'zonasi_amplop', title: 'Zonasi - Amplop'},
        { key: 'basemap', title: 'Basemap Pola Ruang'},
        { key: 'frek_banjir_2019', title: 'Frekuensi Banjir 2019'},
        { key: 'frek_banjir_2020', title: 'Frekuensi Banjir 2020'},
      ],
    },
  ];

  let mapBefore, mapAfter, viewBefore, viewAfter
  let lantaiSebelum,
            lantai,
            lantaiAtas,
            lantaiSebelumKelewatan,
            segmentationGroupLayer = {};
  const sebelumDefinitionExpression = `id_simulasi = ${state[0].simulasiId} AND id_project = ${state[0].projectId} AND userid = '${state[0].userId}'AND data_ke = ${state[0].dataKe}`;
  const sesudahDefinitionExpression = `id_simulasi = ${state[1].simulasiId} AND id_project = ${state[1].projectId} AND userid = '${state[1].userId}'AND data_ke = ${state[1].dataKe}`;


  useEffect(() => {
    if (!state) {
      history.push("/schenario");
    }
  }, [state]);
  useEffect(() => {
    if (mapBeforeDiv.current && mapAfterDiv.current && layerListDiv.current) {
      mapBefore = new Map({
        basemap: "topo-vector",
        ground: "world-elevation",
      });
      mapAfter = new Map({
        basemap: "topo-vector",
        ground: "world-elevation",
      });
      
      viewBefore = new SceneView(viewOptions(mapBefore, mapBeforeDiv, false));
      viewAfter = new SceneView(viewOptions(mapAfter, mapAfterDiv, true));

      viewAfter.on("key-down", function(event) {
        var prohibitedKeys = ["+", "-", "Shift", "_", "="];
        var keyPressed = event.key;
        if (prohibitedKeys.indexOf(keyPressed) !== -1) {
          event.stopPropagation();
        }
      });
      viewAfter.on("mouse-wheel", function(event) {
        event.stopPropagation();
      });
      viewAfter.on("double-click", function(event) {
        event.stopPropagation();
      });
      viewAfter.on("double-click", ["Control"], function(event) {
        event.stopPropagation();
      });
      viewAfter.on("drag", function(event) {
        event.stopPropagation();
      });
      viewAfter.on("drag", ["Shift"], function(event) {
        event.stopPropagation();
      });
      viewAfter.on("drag", ["Shift", "Control"], function(event) {
        event.stopPropagation();
      });

      watchUtils.whenTrue(viewBefore, "stationary", function () {
        viewAfter.camera = viewBefore.camera;
      });
      viewBefore.when(()=> {
        mapBefore.addMany([
          polaRuangVersioningSebelumLayer,
          persilTanahSebelumLayer,
          // kapasitasAirSebelumLayer,
          sampahTpsLayer,
          jalanSebelumLayer,
          bangunanSebelumLayer,
          // frekuensiBanjir2020,
          //   frekuensiBanjir2019,
          //   basemapPolaRuangLayer,
          //   polaRuangEnvelopeLayer,
          //   persilTanahBpn,
          //   buildingsEnvelopeLayer,
        ])
        viewBefore.popup.watch("features", (features) => {
          if(features[0]) {
            let fieldsArr = [];

            if (features[0].layer.id === "bagunan_analisis") {
              viewAfter.whenLayerView(bangunanSesudahLayer).then((bangunanSesudahLayerView) => {
                if (highlight) {
                  highlight.remove();
                }
                console.log(features[0].attributes.objectid)
                highlight = bangunanSesudahLayerView.highlight(features[0].attributes.objectid);
              })
              var queryParams = bangunanSesudahLayer.createQuery()
              queryParams.where = queryParams.where + ` AND objectid = ${features[0].attributes.objectid}`
              bangunanSesudahLayer.queryFeatures(queryParams).then(result => {
                console.log(result.features.length)
                if(result.features.length > 0){
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
                      field_value: result.features[0].attributes.status_kdbklb,
                    },
                    {
                      field_name: "status_kdbklb",
                      field_value: features[0].attributes.status_kdbklb,
                    },
                    {
                      field_name: "melampaui_fa_sebelum",
                      field_value: result.features[0].attributes.melampaui_fa,
                    },
                    {
                      field_name: "melampaui_fa",
                      field_value: features[0].attributes.melampaui_fa,
                    },
                    {
                      field_name: "melampaui_tinggi_sebelum",
                      field_value:
                      result.features[0].attributes.melampaui_tinggi,
                    },
                    {
                      field_name: "melampaui_tinggi",
                      field_value: features[0].attributes.melampaui_tinggi,
                    },
                    {
                      field_name: "izin_air_y5_sebelum",
                      field_value: result.features[0].attributes.izin_air_y5,
                    },
                    {
                      field_name: "izin_air_y5",
                      field_value: features[0].attributes.izin_air_y5,
                    },
                    {
                      field_name: "izin_macet_sebelum",
                      field_value: result.features[0].attributes.izin_macet, //10
                    },
                    {
                      field_name: "izin_macet",
                      field_value: features[0].attributes.izin_macet,
                    },
                    {
                      field_name: "los_num_sebelum",
                      field_value: result.features[0].attributes.los_num,
                    },
                    {
                      field_name: "los_num",
                      field_value: features[0].attributes.los_num,
                    },
                    {
                      field_name: "los_sebelum",
                      field_value: result.features[0].attributes.los,
                    },
                    {
                      field_name: "los",
                      field_value: features[0].attributes.los,
                    },
                    {
                      field_name: "jlh_lantai_sebelum",
                      field_value: result.features[0].attributes.jlh_lantai,
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
                      field_value: result.features[0].attributes.fa, //20
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
                      field_value: result.features[0].attributes.namaszona,
                    },
                    {
                      field_name: "kdb_sebelum",
                      field_value: result.features[0].attributes.kdb,
                    },
                    {
                      field_name: "klb_sebelum",
                      field_value: result.features[0].attributes.klb,
                    },
                    {
                      field_name: "kdh_sebelum",
                      field_value: result.features[0].attributes.kdh, //70
                    },
                    {
                      field_name: "lantai_max_sebelum",
                      field_value: result.features[0].attributes.lantai_max,
                    },
                    {
                      field_name: "status_itbx_sebelum",
                      field_value: result.features[0].attributes.lantai_max, //72
                      // field_value: result.features[0].attributes.status_itbx, //72
                    },
                    {
                      field_name: "status_itbx",
                      field_value: features[0].attributes.lantai_max,
                      // field_value: features[0].attributes.status_itbx,
                    },
                    {
                      field_name: "kegiatan_sebelum",
                      field_value: result.features[0].attributes.kegiatan, //74
                    },
                    {
                      field_name: "kegiatan",
                      field_value: features[0].attributes.kegiatan,
                    },
                    {
                      field_name: "kbli_sebelum",
                      field_value: result.features[0].attributes.kbli,
                    },
                    {
                      field_name: "kbli",
                      field_value: features[0].attributes.kbli,
                    },
                    {
                      field_name: "jenis_bang_sebelum",
                      field_value: result.features[0].attributes.jenis_bang, //78
                    },
                    {
                      field_name: "q_arus_sebelum",
                      field_value: result.features[0].attributes.q_arus,
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
                      result.features[0].attributes.keb_air_harian_y5,
                    },
                    {
                      field_name: "pdam_kapasitas_harian_sebelum",
                      field_value:
                      result.features[0].attributes.pdam_kapasitas_harian,
                    },
                    {
                      field_name: "izin_sampah_y5",
                      field_value: features[0].attributes.izin_sampah_y5, //85
                    },
                    {
                      field_name: "timbulan_sampah_harian_m3",
                      field_value:
                        features[0].attributes.timbulan_sampah_harian_m3,
                    },
                    {
                      field_name: "sum_timbulan_sampah_harian_m3",
                      field_value:
                        features[0].attributes.sum_timbulan_sampah_harian_m3,
                    },
                    {
                      field_name: "total_kapasitas",
                      field_value: features[0].attributes.total_kapasitas,//88
                    },
                    {
                      field_name: "jlh_biopori",
                      field_value:
                        features[0].attributes.jlh_biopori,
                    },
                    {
                      field_name: "kapasitas_biopori",
                      field_value:
                        features[0].attributes.kapasitas_biopori,//90
                    },
                    {
                      field_name: "surplus_debitalir",
                      field_value:
                        features[0].attributes.surplus_debitalir,
                    },
                    {
                      field_name: "kecenderungan_banjir",
                      field_value:
                        features[0].attributes.kecenderungan_banjir,
                    },
                  ]);
              }
              })

              if (features[0].attributes.objectid) {
                setSegmentationBuildingId(features[0].attributes.objectid);
                setRemoveSegmentationFunc(() => () => {
                  bangunanSesudahLayer.definitionExpression =
                    sesudahDefinitionExpression;
                    bangunanSebelumLayer.definitionExpression =
                    sebelumDefinitionExpression;
                  mapAfter.remove(segmentationGroupLayer);
                  mapBefore.remove(segmentationGroupLayer);
                  setIsSegmentationActive(false);
                  if (document.getElementById("segmentationLegendCard")) {
                    document.getElementById(
                      "segmentationLegendCard"
                    ).style.display = "none";
                  }
                });
                setShowSegmentationFunc((id) => (id) => {
                  bangunanSesudahLayer.definitionExpression =
                    sesudahDefinitionExpression + "AND NOT objectid = " + id;
                    bangunanSebelumLayer.definitionExpression =
                    sebelumDefinitionExpression + "AND NOT objectid = " + id;
                  mapAfter.add(segmentationGroupLayer);
                  mapBefore.add(segmentationGroupLayer);
                  viewAfter.whenLayerView(lantaiAtas).then(function (layerView) {
                    layerView.highlight(lantaiAtas.graphics);
                  });
                  viewBefore.whenLayerView(lantaiAtas).then(function (layerView) {
                    layerView.highlight(lantaiAtas.graphics);
                  });
                  viewAfter.whenLayerView(lantai).then(function (layerView) {
                    layerView.highlight(lantai.graphics);
                  });
                  viewBefore.whenLayerView(lantai).then(function (layerView) {
                    layerView.highlight(lantai.graphics);
                  });
                  viewAfter
                    .whenLayerView(lantaiSebelum)
                    .then(function (layerView) {
                      layerView.highlight(lantaiSebelum.graphics);
                    });
                    viewBefore
                    .whenLayerView(lantaiSebelum)
                    .then(function (layerView) {
                      layerView.highlight(lantaiSebelum.graphics);
                    });
                  viewAfter
                    .whenLayerView(lantaiSebelumKelewatan)
                    .then(function (layerView) {
                      layerView.highlight(lantaiSebelumKelewatan.graphics);
                    });
                    viewBefore
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
                getRing(features[0].attributes.oid_historical);
                // features[0].layer.definitionExpression =
                //   "NOT id_bangunan = " + features[0].attributes.id_bangunan;
              }
            } else {
              setContentGeneral(fieldsArr);
            }
            setShowingPopop({
              ...showingPopup,
              show: !showingPopup.show,
              title: features[0].layer.title,
            });
          }
        })
        viewBefore.ui.add(legendExpand, "top-left")
        const layerListExpand = new Expand({
          autoCollapse: true,
          content: document.getElementById("layerListDiv"),
          view: viewBefore,
          expandTooltip: "Daftar Layer",
          expandIconClass: "esri-icon-layer-list",
        });
        viewBefore.ui.add(layerListExpand, "top-left")
      })
      viewAfter.when(() => {

        mapAfter.addMany([
          polaRuangVersioningSesudahLayer,
          persilTanahSesudahLayer,
          // kapasitasAirSesudahLayer,
          sampahTpsLayer,
          jalanSesudahLayer,
          bangunanSesudahLayer,
          // frekuensiBanjir2020,
          //   frekuensiBanjir2019,
          //   basemapPolaRuangLayer,
          //   polaRuangEnvelopeLayer,
          //   persilTanahBpn,
          //   buildingsEnvelopeLayer,
        ])
      })

    }
  }, []);

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
    url:
      config.url.ARCGIS_URL +
      "/Versioning/bangunan_analisis_process/FeatureServer/0",
    id: "bagunan_analisis_proses",
    visible: false,
    renderer: getRendererBangunan("itbx", "jlh_lantai"),
    definitionExpression: sesudahDefinitionExpression,
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
  const bangunanSebelumLayer = new FeatureLayer({
    url:
      config.url.ARCGIS_URL +
      "/Versioning/bangunan_analisis/FeatureServer/0",
    id: "bagunan_analisis",
    visible: false,
    renderer: getRendererBangunan("itbx", "jlh_lantai"),
    definitionExpression: sebelumDefinitionExpression,
    elevationInfo: {
      mode: "on-the-ground",
    },
    title: "Bangunan Proses",
    listMode: "hide",
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

  const kapasitasAirSesudahLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/kapasitas_air/FeatureServer/0",
    id: "kapasitas_air_analisis_proses",
    title: "Kapasitas Air",
    visible: false,
    popupTemplate: {
      title: "Kapasitas Air",
    },
    outFields: ["*"],
    editingEnabled: false,
    definitionExpression: sesudahDefinitionExpression,
  });
  const kapasitasAirSebelumLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/kapasitas_air/FeatureServer/0",
    id: "kapasitas_air_analisis",
    title: "Kapasitas Air",
    visible: false,
    popupTemplate: {
      title: "Kapasitas Air",
    },
    outFields: ["*"],
    editingEnabled: false,
    definitionExpression: sebelumDefinitionExpression,
  });

  const sampahTpsLayer = new FeatureLayer({
    url:
      config.url.ARCGIS_URL + "/Persampahan/Sampah_TPS/FeatureServer/0",
    title: "Sampah TPS",
    visible: false,
    popupTemplate: {
      title: "Sampah TPS",
    },
    outFields: ["*"],
    editingEnabled: false,
    /* renderer: {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "object", // autocasts as new ObjectSymbol3DLayer()
            height: 4, // height of the object in meters
            // width: 3,
            // depth: 15,
            resource: {
              href: "https://rdtr.onemap.id/backend/Template/dumpster/scene.gltf",
            },
            // heading: 270,
          },
        ],
      },
    }, */
    renderer: {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "web-style", // autocasts as new WebStyleSymbol()
        name: "Trash_Can_2",
        styleName: "EsriRealisticStreetSceneStyle",
      },
      visualVariables: [
        {
          type: "size",
          field: "kapasitas",
          axis: "height",
        },
        {
          type: "color",
          field: "status_tps_int", 
          stops: [
            { value: 1, color: "green" }, 
            { value: 2, color: "red" }, 
          ]
        }
      ],
    },
  });

  const persilTanahSesudahLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/Versioning/persiltanah_analisis_process/FeatureServer/0",
    title: "Persil Tanah",
    visible: false,
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
    definitionExpression: sesudahDefinitionExpression,
  });
  const persilTanahSebelumLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/Versioning/persiltanah_analisis_process/FeatureServer/0",
    title: "Persil Tanah",
    visible: false,
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
    definitionExpression: sebelumDefinitionExpression,
  });

  const polaRuangVersioningSesudahLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/Versioning/polaruang_analisis_process/FeatureServer/0",
    id: "pola_ruang_analisis_proses",
    title: "Pola Ruang Versioning",
    visible: false,
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
    definitionExpression: sesudahDefinitionExpression,
  });
  const polaRuangVersioningSebelumLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/Versioning/polaruang_analisis_process/FeatureServer/0",
    id: "pola_ruang_analisis",
    title: "Pola Ruang Versioning",
    visible: false,
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
    definitionExpression: sebelumDefinitionExpression,
  });

  const jalanSesudahLayer = new FeatureLayer({
    url:
      config.url.ARCGIS_URL + "/Versioning/jalan_analisis_process/FeatureServer/0",
    title: "Jaringan Jalan",
    id: "jaringan_jalan_analisis_proses",
    visible: false,
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
    definitionExpression: sesudahDefinitionExpression,
  });
  const jalanSebelumLayer = new FeatureLayer({
    url:
      config.url.ARCGIS_URL + "/Versioning/jalan_analisis_process/FeatureServer/0",
    title: "Jaringan Jalan",
    id: "jaringan_jalan_analisis",
    visible: false,
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
    definitionExpression: sebelumDefinitionExpression,
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
    visible: false,
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
    visible: false,
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
    visible: false,
  });

  const persilTanahBpn = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/persil_tanah_bpn/FeatureServer/0",
    title: "Persil Tanah - BPN",
    visible: false,
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

  const frekuensiBanjir2019 = new FeatureLayer({
    url: "https://rdtr.onemap.id/server/rest/services/Hosted/Frekuensi_banjir_2019/FeatureServer/0",
    title: "Frekuensi Banjir 2019",
    visible: false,
    outFields: ["*"],
    editingEnabled: false,
    elevationInfo: {
      mode: "on-the-ground",
    },
    popupTemplate: {
      title: "Frekuensi Banjir 2019",
    },
  });

  const frekuensiBanjir2020 = new FeatureLayer({
    url: "https://rdtr.onemap.id/server/rest/services/Hosted/Frekuensi_banjir_2020/FeatureServer/0",
    title: "Frekuensi Banjir 2020",
    outFields: ["*"],
    visible: false,
    editingEnabled: false,
    elevationInfo: {
      mode: "on-the-ground",
    },
    popupTemplate: {
      title: "Frekuensi Banjir 2020",
    },
  });

  const legend = new Legend({
    view: viewBefore,
  })

  const legendExpand = new Expand({
    autoCollapse: true,
    content: legend,
    view: viewBefore,
    expandTooltip: "Legenda",
    expandIconClass: "esri-icon-legend",
  });

  const viewOptions = (map, div, isAfter) => {
    var options = {
      container: div.current,
      map: map,
      camera: {
        position: [106.7936983, -6.5989447, 682.98652],
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
    };
    if (isAfter) {
      options.navigation = {
        gamepad: {
          enabled: false,
        },
        browserTouchPanEnabled: false,
        momentumEnabled: false,
        mouseWheelZoomEnabled: false,
      };
      options.ui = {
            components: ["attribution"]
      }
    }
    return options
  };

  const checkLayerList = (key, info) => {
    console.log(key, info)
    if(info.checked === true){
      if(key == "bangunan"){
        bangunanSebelumLayer.visible = info.checked
      }
    }
    switch (info.node.key) {
        case "bangunan":
          bangunanSebelumLayer.visible = info.checked
          bangunanSesudahLayer.visible = info.checked
          break;
          case "jalan":
        jalanSebelumLayer.visible = info.checked
        jalanSesudahLayer.visible = info.checked
        break;
        case "sampah":
          console.log("sampah")
        sampahTpsLayer.visible = info.checked
        break;
        case "air":
        kapasitasAirSebelumLayer.visible = info.checked
        kapasitasAirSesudahLayer.visible = info.checked
        break;
        case "persil":
        persilTanahSesudahLayer.visible = info.checked
        break;
        case "0":
          bangunanSebelumLayer.visible = info.checked
          bangunanSesudahLayer.visible = info.checked
          jalanSebelumLayer.visible = info.checked
        jalanSesudahLayer.visible = info.checked
        sampahTpsLayer.visible = info.checked
        kapasitasAirSebelumLayer.visible = info.checked
        kapasitasAirSesudahLayer.visible = info.checked
        persilTanahSesudahLayer.visible = info.checked
        break;
        case "bangunan_amplop":
        buildingsEnvelopeLayer.visible = info.checked
        break;
        case "zonasi_amplop":
        polaRuangEnvelopeLayer.visible = info.checked
        break;
        case "basemap":
        basemapPolaRuangLayer.visible = info.checked
        break;
        case "bpn":
        persilTanahBpn.visible = info.checked
        break;
        case "frek_banjir_2019":
        frekuensiBanjir2019.visible = info.checked
        break;
        case "frek_banjir_2020":
        frekuensiBanjir2020.visible = info.checked
        break;
        case "1":
        buildingsEnvelopeLayer.visible = info.checked
        polaRuangEnvelopeLayer.visible = info.checked
        basemapPolaRuangLayer.visible = info.checked
        persilTanahBpn.visible = info.checked
        frekuensiBanjir2019.visible = info.checked
        frekuensiBanjir2020.visible = info.checked
        break;
      default:
        break;
    }
  }

  function toFix(x, fixed = 3) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x = parseFloat(
          x.toString().split("e-")[0].split(".")[0] + "e-" + e
        ).toFixed(e);
      } else {
        var str = "";
        var split = x.toString().split("");
        for (var i = 0; i < split.length; i++) {
          str += split[i];
          if (split[i] > 0 && i > 2) {
            break;
          }
        }
        x = parseFloat(str);
      }
    } else {
      x = parseFloat(x.toFixed(fixed));
    }
    return x;
  }

  const handleCloseShowingPopup = () => {
    setItbxSum(null);
    // viewBefore.popup.close();
    setShowingPopop({ ...showingPopup, show: false, title: "" });
  };
  // end close showing popup
  const handleSebelumSesudah = () => {
    setActiveSebelumSesudah({
      ...activeSebelumSesudah,
      activeSebelum: !activeSebelumSesudah.activeSebelum,
    });
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

  // start segmentation drawing function
          /************************************************************
           * Get polygon id from feature service and draw it when available
           ************************************************************/
           var getRing = (id) => {
            var sesudah = Axios.get(
              "https://localhost:8443/server/rest/services/Versioning/bangunan_analisis_process/FeatureServer/0/query?where=oid_historical=" +
                id +
                " AND " +
                sesudahDefinitionExpression +
                "&outFields=*&outSR=4326&f=pjson"
            );
            var sebelum = Axios.get(
              "https://localhost:8443/server/rest/services/Versioning/bangunan_analisis/FeatureServer/0/query?where=objectid=" +
                id +
                " AND " +
                sebelumDefinitionExpression +
                "&outFields=*&outSR=4326&f=pjson"
            );
            Promise.all([sesudah, sebelum])
              .then((result) => {
                console.log(result);
                if (
                  result[0].data.features[0].length > 0 &&
                  result[1].data.features[0].length > 0
                ) {
                  drawGraphic(
                    result[0].data.features[0].geometry.rings,
                    result[0].data.features[0].attributes,
                    result[1].data.features[0].attributes
                  );
                }
              })
              .catch((error) => {
                console.error("Gagal mendapatkan data segementasi", error);
              });
            // var request = new XMLHttpRequest();
            // request.open(
            //   "GET",
            //   "https://rdtr.onemap.id/server/rest/services/sesudah/bangunan/FeatureServer/0/query?where=objectid=" +
            //     id +
            //     "&outFields=*&outSR=4326&f=pjson",
            //   true
            // );

            // request.onload = function () {
            //   if (this.status >= 200 && this.status < 400) {
            //     // Success!
            //     var { features } = JSON.parse(this.response);
            //     if (features[0])
            //       drawGraphic(
            //         features[0].geometry.rings,
            //         features[0].attributes
            //       );
            //   } else {
            //     // We reached our target server, but it returned an error
            //   }
            // };

            // request.onerror = function () {
            //   // There was a connection error of some sort
            // };

            // request.send();
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
          var drawGraphic = (ring, attributes, attributes_sebelum) => {
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
                  attributes_sebelum.jlh_lantai < attributes.lantai_max &&
                    attributes_sebelum.jlh_lantai
                    ? attributes_sebelum.jlh_lantai < attributes.jlh_lantai
                      ? attributes_sebelum.jlh_lantai
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
                      !attributes_sebelum.jlh_lantai &&
                      !attributes.lantai_max
                    ? attributes.jlh_lantai
                    : !attributes.jlh_lantai &&
                      attributes_sebelum.jlh_lantai &&
                      !attributes.lantai_max
                    ? attributes_sebelum.jlh_lantai
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
                  attributes_sebelum.jlh_lantai > attributes.lantai_max
                    ? attributes_sebelum.jlh_lantai < attributes.jlh_lantai
                      ? attributes_sebelum.jlh_lantai - attributes.lantai_max
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
                  expression: attributes_sebelum.jlh_lantai, //lantai sebelum
                },
                unit: "meters",
              },
            });
            lantai.add(
              new Graphic({
                geometry: polygon,
                symbol: getSymbol(
                  attributes.jlh_lantai > attributes_sebelum.jlh_lantai &&
                    attributes_sebelum.jlh_lantai
                    ? attributes.lantai_max - attributes_sebelum.jlh_lantai
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
                    attributes_sebelum.jlh_lantai +
                    (attributes.lantai_max - attributes_sebelum.jlh_lantai > 0
                      ? attributes.lantai_max - attributes_sebelum.jlh_lantai
                      : 0), //lantai (lantai max - lantai sebelum) + lantai ssebelum
                },
                unit: "meters",
              },
            });
            lantaiAtas.add(
              new Graphic({
                geometry: polygon,
                symbol: getSymbol(
                  attributes.jlh_lantai > attributes_sebelum.jlh_lantai &&
                    attributes_sebelum.jlh_lantai
                    ? attributes.jlh_lantai -
                        attributes_sebelum.jlh_lantai -
                        (attributes.lantai_max - attributes_sebelum.jlh_lantai >
                        0
                          ? attributes.lantai_max -
                            attributes_sebelum.jlh_lantai
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
            mapAfter.remove(segmentationGroupLayer);
            mapBefore.remove(segmentationGroupLayer);
            bangunanSesudahLayer.definitionExpression =
              sesudahDefinitionExpression;
              bangunanSebelumLayer.definitionExpression =
              sebelumDefinitionExpression;
            setIsSegmentationActive(false);
            // segmentationGroupLayer.visible = false
            if (document.getElementById("segmentationLegendCard")) {
              document.getElementById("segmentationLegendCard").style.display =
                "none";
            }
          };
          // end segementation drawing function

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="schenario" />
        <div className="main-panel">
          <div className="container-scroller d-md-flex flex-row">
            <div style={{ position: "relative", width: "50%" }}>
              <div
                className="mapDiv"
                style={style.viewDiv}
                ref={mapBeforeDiv}
              ></div>
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  right: 8,
                  backgroundColor: "white",
                  minWidth: "max-content",
                  padding: "0.7rem"
                }}
              >
                {state[0].name}
              </div>
            </div>
            <div style={{ position: "relative", width: "50%" }}>
              <div
                className="mapDiv"
                style={style.viewDiv}
                ref={mapAfterDiv}
              ></div>
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  right: 8,
                  backgroundColor: "white",
                  minWidth: "max-content",
                  padding: "0.7rem"
                }}
              >
                                {state[1].name}
              </div>
            </div>
          </div>
          {/* <Footer /> */}
          <div className="container-scroller d-md-flex flex-row">
          <div className="esri-widget" id="layerListDiv" ref={layerListDiv}>
          <div
                style={{
                  backgroundColor: "#fff",
                  paddingTop: "10px",
                  textAlign: "center",
                }}
              >
                <h3 className="esri-widget__heading">Daftar Layer</h3>
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
          <Tree
          className="myCls"
          showLine
          checkable
          selectable={false}
          defaultExpandAll
          onCheck={checkLayerList}
          treeData={treeData}
        />
        </div>
        </div>
          </div>
          <div style={{ position: "relative", width: "50%" }} ref={legendDiv}></div>
          </div>
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
                {showingPopup.title.toLowerCase().indexOf("bangunan") !== -1 ? (
                  <>
                    {/* start popup sebelumsesudah */}
                    <div className="switch-sebelum-sesudah">
                      <div className="switch-button">
                        <input
                          className="switch-button-checkbox"
                          type="checkbox"
                          onChange={handleSebelumSesudah}
                          checked={activeSebelumSesudah.activeSebelum}
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

                      {<div className="segementation-container">
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
                      </div>}
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
                         { <div
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
                          </div>}

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
                                      <tr>
                                        <td>Status Kapasitas TPS</td>
                                        <td>
                                          {activeSebelumSesudah.activeSebelum
                                            ? contentBangunanKdbKlb[85]
                                                .field_value
                                            : contentBangunanKdbKlb[85]
                                                .field_value}
                                        </td>
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
                                      <td>
                                        Luas Tapak (m<sup>2</sup>)
                                      </td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[18]
                                              .field_value
                                            ? toFix(
                                                contentBangunanKdbKlb[18]
                                                  .field_value,
                                                2
                                              )
                                            : contentBangunanKdbKlb[18]
                                                .field_value
                                          : contentBangunanKdbKlb[19]
                                              .field_value
                                          ? toFix(
                                              contentBangunanKdbKlb[19]
                                                .field_value,
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
                                          ? "Luas Bangunan"
                                          : "Luas Bangunan Saat Ini"}{" "}
                                        (m<sup>2</sup>)
                                      </td>
                                      <td>
                                        {activeSebelumSesudah.activeSebelum
                                          ? contentBangunanKdbKlb[20]
                                              .field_value
                                            ? toFix(
                                                contentBangunanKdbKlb[20]
                                                  .field_value,
                                                2
                                              )
                                            : contentBangunanKdbKlb[20]
                                                .field_value
                                          : contentBangunanKdbKlb[21]
                                              .field_value
                                          ? toFix(
                                              contentBangunanKdbKlb[21]
                                                .field_value,
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
                                          ? toFix(
                                              contentBangunanKdbKlb[65]
                                                .field_value,
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
                                            ? toFix(
                                                contentBangunanKdbKlb[68]
                                                  .field_value,
                                                3
                                              )
                                            : contentBangunanKdbKlb[68]
                                                .field_value
                                          : contentBangunanKdbKlb[62]
                                              .field_value
                                          ? toFix(
                                              contentBangunanKdbKlb[62]
                                                .field_value,
                                              3
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
                                            ? toFix(
                                                contentBangunanKdbKlb[69]
                                                  .field_value
                                              )
                                            : contentBangunanKdbKlb[69]
                                                .field_value
                                          : contentBangunanKdbKlb[63]
                                              .field_value
                                          ? toFix(
                                              contentBangunanKdbKlb[63]
                                                .field_value
                                            )
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
                                            ? toFix(
                                                contentBangunanKdbKlb[70]
                                                  .field_value,
                                                3
                                              )
                                            : contentBangunanKdbKlb[70]
                                                .field_value
                                          : contentBangunanKdbKlb[64]
                                              .field_value
                                          ? toFix(
                                              contentBangunanKdbKlb[64]
                                                .field_value,
                                              3
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

                          {
                            <div
                              className="card"
                              style={{ margin: "0 0.2rem" }}
                            >
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
                                        <td>Status Kapasitas TPS</td>
                                        <td>
                                          {activeSebelumSesudah.activeSebelum
                                            ? contentBangunanKdbKlb[85]
                                                .field_value
                                            : contentBangunanKdbKlb[85]
                                                .field_value}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          Timbulan Sampah Harian (Bangunan)
                                        </td>
                                        <td>
                                          {contentBangunanKdbKlb[86].field_value
                                            ? toFix(
                                                contentBangunanKdbKlb[86]
                                                  .field_value,
                                                3
                                              )
                                            : contentBangunanKdbKlb[86]
                                                .field_value}{" "}
                                          m<sup>3</sup>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          Timbulan Sampah Harian (TPS Kumulatif)
                                        </td>
                                        <td>
                                          {contentBangunanKdbKlb[87].field_value
                                            ? toFix(
                                                contentBangunanKdbKlb[87]
                                                  .field_value,
                                                3
                                              )
                                            : contentBangunanKdbKlb[87]
                                                .field_value}{" "}
                                          m<sup>3</sup>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Total Kapasitas TPS</td>
                                        <td>
                                          {contentBangunanKdbKlb[88].field_value
                                            ? toFix(
                                                contentBangunanKdbKlb[88]
                                                  .field_value,
                                                3
                                              )
                                            : contentBangunanKdbKlb[88]
                                                .field_value}{" "}
                                          m<sup>3</sup>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          }

<div
                              className="card"
                              style={{ margin: "0 0.2rem" }}
                            >
                              <div
                                className="card-header"
                                role="tab"
                                id="headingFive"
                                style={{ padding: "0px" }}
                              >
                                <h6 className="mb-0">
                                  <button
                                    className="btn btn-block text-left collapsed btn-sm"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target={"#sebelumLima"}
                                    aria-expanded="true"
                                    aria-controls={"sebelumLima"}
                                    style={{ fontSize: "14px" }}
                                  >
                                    <img
                                      src="./images/flood.png"
                                      alt="Banjir"
                                      style={{
                                        marginRight: "10px",
                                        width: "16px",
                                      }}
                                    />
                                    Banjir
                                    <i className="ti-arrow-circle-down float-right"></i>
                                  </button>
                                </h6>
                              </div>

                              <div
                                id="sebelumLima"
                                className="collapse"
                                aria-labelledby="headingFive"
                                data-parent="#accordionExample"
                              >
                                <div className="card-body">
                                  <table className="table">
                                    <tbody>
                                      <tr>
                                        <td>Jumlah Biopori</td>
                                        <td>
                                          {contentBangunanKdbKlb[89]
                                                .field_value}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          Kapasitas Biopori
                                        </td>
                                        <td>
                                          {contentBangunanKdbKlb[90]
                                                .field_value}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          Surplus Debit Alir
                                        </td>
                                        <td>
                                          {contentBangunanKdbKlb[91]
                                                .field_value ? toFix(contentBangunanKdbKlb[91]
                                                  .field_value) : contentBangunanKdbKlb[91]
                                                  .field_value}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Kecendrungan Banjir</td>
                                        <td>
                                          {contentBangunanKdbKlb[92]
                                                .field_value}
                                        </td>
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
        </div>
      </div>
    </div>
  );
}

const style = {
  viewDiv: {
    padding: ".25rem",
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

export default SimulationHistory;
