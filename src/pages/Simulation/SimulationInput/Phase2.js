import { useEffect, useRef, useState } from "react";
import { isLoaded, loadModules } from "esri-loader";
import { useHistory, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

import { config } from "../../../Constants";
import axios from "../../../axiosConfig";
import { Header, Menu, Footer, ProgressCircle } from "../../../components";
import getDefExp from "../../../getDefExp";

function SimulationInputPhase2() {
  const mapRef = useRef();
  const history = useHistory();
  const { state } = useLocation();
  const [esriMap, setEsriMap] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState({ objectid: null });
  const [mapLoaded, setMapLoaded] = useState(true);
  const [errMessage, setErrMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateSimulasi = () => {
    if (selectedFeature.objectid) {
      setIsProcessing(true);
      setErrMessage(null);
      axios
        .post(config.url.API_URL + "/Simulasi/Create", {
          name: state.name,
          ownerId: Cookies.get("userId"),
          projectId: state.projectId,
          dataKe: state.simulasiBangunan.dataKe,
          wadmpr: selectedFeature.wadmpr,
          wadmkk: selectedFeature.wadmkk,
          wiadpr: selectedFeature.wiadpr,
          wiadkk: selectedFeature.wiadkk,
          nambwp: selectedFeature.nambwp,
          nasbwp: selectedFeature.nasbwp,
          kodblk: selectedFeature.kodblk,
          kodsbl: selectedFeature.kodsbl,
        })
        .then(() => {
          setIsProcessing(false);
          history.push("/schenario");
        })
        .catch((error) => {
          setIsProcessing(false);
          error.response?.data?.status?.message
            ? setErrMessage(error.response?.data?.status?.message)
            : setErrMessage(
                "Gagal mendaftarkan skenario. Silahkan coba beberapa saat lagi."
              );
        });
    } else {
      setErrMessage(
        "Pilih data yang tersedia pada kanan peta terlebih dahulu untuk membuat skenario"
      );
    }
  };

  useEffect(() => {
    if (!state) {
      history.push("/schenario");
    }
  }, [state]);

  useEffect(() => {
    if (!mapLoaded) {
      console.log(selectedFeature);
      const polaRuang = esriMap.map.allLayers.find(function (layer) {
        return layer.id === "pola_ruang";
      });
      if (highlight) {
        highlight.remove();
      }

      polaRuang
        .queryExtent({ where: "objectid = " + selectedFeature.objectid })
        .then(({ extent }) => {
          esriMap.extent = extent;
        });
      esriMap
        .whenLayerView(polaRuang)
        .then(function (layerView) {
          // The layerview for the layer
          setHighlight(layerView.highlight(selectedFeature.objectid));
        })
        .catch(function (error) {
          // An error occurred during the layerview creation
        });
    }
  }, [selectedFeature.objectid]);

  useEffect(() => {
    if (mapLoaded) {
      var modules = loadModules(
        [
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/FeatureLayer",
          "esri/core/watchUtils",
          "esri/widgets/Search",
        ],
        {
          css: true,
          version: "4.21",
        }
      ).then(([Map, MapView, FeatureLayer, watchUtils, Search]) => {
        const map = new Map({
          basemap: "topo-vector",
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          zoom: 4,
          center: [106.817, 4], // longitude, latitude
        });

        const polaRuang = new FeatureLayer({
          url:
            config.url.ARCGIS_URL +
            "/Versioning/polaruang_analisis/FeatureServer/0",
          id: "pola_ruang",
          popupEnabled: true,
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
                ],
              },
            ],
          },
          definitionExpression: getDefExp({
            projectId: state.projectId,
            dataKe: state.simulasiBangunan.dataKe,
          }),
        });

        const bangunan = new FeatureLayer({
          url:
            config.url.ARCGIS_URL +
            "/Versioning/bangunan_analisis/FeatureServer/0",
          definitionExpression: getDefExp({
            projectId: state.projectId,
            dataKe: state.simulasiBangunan.dataKe,
          }),
        });

        const searchWidget = new Search({
          view: view,
        });

        view.ui.add(searchWidget, {
          position: "top-right",
          index: 2,
        });

        map.add(polaRuang);
        map.add(bangunan);

        watchUtils.whenTrue(view, "stationary", function () {
          var query = polaRuang.createQuery();
          query.geometry = view.extent;
          query.resultRecordCount = 100;
          setIsProcessing(true);
          setErrMessage(null);
          setFeatures([]);
          polaRuang
            .queryFeatures(query)
            .then(({ features }) => {
              let mapFeatures = features.map((x) => x.attributes);
              setFeatures(mapFeatures);
              setIsProcessing(false);
            })
            .catch((error) => {
              setErrMessage(error.message);
              setIsProcessing(false);
            });
        });

        view.when(() => {
          setMapLoaded(false);
          setEsriMap(view);
        });

        view.popup.watch("features", (features) => {
          if (features[0]) {
            console.log(features[0]);
            if (features[0].layer.id) {
              if (
                features[0].layer.id.toLowerCase().indexOf("pola_ruang") !== -1
              ) {
                setSelectedFeature(features[0].attributes);
              }
            }
          }
        });
      });
    }
  }, [mapLoaded]);

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="skenario" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-12">
                <div className="mb-2">
                  {
                    <div className="float-right">
                      <ProgressCircle className="text-muted"></ProgressCircle>
                      <ProgressCircle className="text-primary"></ProgressCircle>
                    </div>
                  }
                  <h1>Skenario Baru</h1>
                  <p className="text-muted">
                    Pilih sub-blok yang diinginkan dengan cara geser peta lalu
                    pilih pilihan di sisi kanan
                  </p>
                </div>
                {errMessage && (
                  <div className="alert alert-warning" role="alert">
                    {errMessage}
                  </div>
                )}
                <div className="row">
                  <div className="col-8 d-none d-md-block d-lg-block">
                    <div style={style.viewDiv} ref={mapRef} />
                  </div>
                  <div className="col-md-4 card">
                    <div className="card-body" style={style.listFeature}>
                      {isProcessing && (
                        <>
                          <div
                            className="spinner-grow text-primary"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div
                            className="spinner-grow text-secondary"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div
                            className="spinner-grow text-success"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div
                            className="spinner-grow text-danger"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div
                            className="spinner-grow text-warning"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                          <div className="spinner-grow text-info" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                        </>
                      )}
                      {features.length > 0 && !isProcessing && (
                        <ul className="icon-data-list list-group list-group-flush">
                          {features.map((feature) => (
                            <li
                              style={style.feature}
                              onClick={() => setSelectedFeature(feature)}
                              className={`list-group-item list-group-item-action ${
                                selectedFeature.objectid === feature.objectid
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <p className="title mb-0">wadmpr</p>
                              <p className="title font-weight-bolder">
                                {feature.wadmpr}
                              </p>
                              <p className="title mb-0">wadmkk</p>
                              <p className="title font-weight-bolder">
                                {feature.wadmkk}
                              </p>
                              <p className="title mb-0">wiadpr</p>
                              <p className="title font-weight-bolder">
                                {feature.wiadpr}
                              </p>
                              <p className="title mb-0">wiadkk</p>
                              <p className="title font-weight-bolder">
                                {feature.wiadkk}
                              </p>
                              <p className="title mb-0">nambwp</p>
                              <p className="title font-weight-bolder">
                                {feature.nambwp}
                              </p>
                              <p className="title mb-0">nasbwp</p>
                              <p className="title font-weight-bolder">
                                {feature.nasbwp}
                              </p>
                              <p className="title mb-0">kodblk</p>
                              <p className="title font-weight-bolder">
                                {feature.kodblk}
                              </p>
                              <p className="title mb-0">kodsbl</p>
                              <p className="title font-weight-bolder">
                                {feature.kodsbl}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="template-demo float-sm-left float-md-right">
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={() =>
                      history.push("/schenarioinput", {
                        name: state.name,
                        project: {
                          kotaKabupaten: {
                            id: state.project.kotaKabupaten.id,
                            provinsi: {
                              id: state.project.kotaKabupaten.provinsi.id,
                            },
                          },
                        },
                        projectId: state.projectId,
                        simulasiBangunan: {
                          dataKe: state.dataKe,
                        },
                      })
                    }
                  >
                    Kembali
                  </button>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isProcessing}
                    onClick={handleCreateSimulasi}
                  >
                    {isProcessing && (
                      <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    )}
                    Buat Skenario
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

const style = {
  viewDiv: {
    padding: 0,
    margin: 0,
    height: "calc(100vh - 200px)",
    // height: "100vh",
    // height: "380px",
    width: "100%",
    fallbacks: [
      { width: "-moz-calc(100vh - 110px)" },
      { width: "-webkit-calc(100vh - 110px)" },
      { width: "-o-calc(100vh - 110px)" },
    ],
  },
  listFeature: {
    overflowX: "auto",
    height: "calc(100vh - 200px)",
  },
  feature: {
    cursor: "pointer",
  },
};

export default SimulationInputPhase2;
