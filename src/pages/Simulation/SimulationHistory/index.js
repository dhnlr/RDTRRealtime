import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";
import Tree, { TreeNode } from 'rc-tree';

import { Header, Menu, Footer } from "../../../components";
import { config } from "../../../Constants";

import "./index.css"

import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import Legend from "@arcgis/core/widgets/Legend"
import * as watchUtils from "@arcgis/core/core/watchUtils";

function SimulationHistory() {
  let history = useHistory();

  const mapBeforeDiv = useRef(null);
  const mapAfterDiv = useRef(null);
  const legendDiv = useRef(null)

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

  useEffect(() => {
    if (mapBeforeDiv.current && mapAfterDiv.current) {
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
        viewBefore.ui.add(legend)
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
    // definitionExpression: bangunanDefinitionExpression,
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
    // definitionExpression: bangunanDefinitionExpression,
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
  });
  const persilTanahSebelumLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/Versioning/persiltanah_analisis/FeatureServer/0",
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
    // outFields: ["id_polaruang", "namazona"],
  });
  const polaRuangVersioningSebelumLayer = new FeatureLayer({
    url: config.url.ARCGIS_URL + "/Versioning/polaruang_analisis/FeatureServer/0",
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
    // outFields: ["id_polaruang", "namazona"],
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
  });
  const jalanSebelumLayer = new FeatureLayer({
    url:
      config.url.ARCGIS_URL + "/Versioning/jalan_analisis/FeatureServer/0",
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
    container: legendDiv.current
  })

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

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="simulasi" />
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
                  top: 0,
                  right: 0,
                  backgroundColor: "white",
                  minWidth: "max-content",
                }}
              >
                Sebelum
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
                  top: 0,
                  right: 0,
                  backgroundColor: "white",
                  minWidth: "max-content",
                }}
              >
                Sesudah
              </div>
            </div>
          </div>
          {/* <Footer /> */}
          <div className="container-scroller d-md-flex flex-row">
          <div style={{ position: "relative", width: "50%" }}>
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
          <div style={{ position: "relative", width: "50%" }} ref={legendDiv}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default SimulationHistory;
