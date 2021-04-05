import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import { Header, Menu, Footer, Img } from "../../components";
import { useHistory } from "react-router-dom";
import "./simulasi.css";
import Axios from "axios";

export const Simulasi = () => {
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
        ],
        {
          css: true,
          version: "4.18",
        }
      ).then(([Map, SceneView, FeatureLayer, Legend, watchUtils, Expand, Graphic, Query, Editor]) => {
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
          defaultSymbol: getSymbol("yellow"),
          defaultLabel: "Eksisting",
          field: "status_kdbklb",
          uniqueValueInfos: [
            {
              value: "Diterima",
              symbol: getSymbol("green"),
              label: "Diterima",
            },
            {
              value: "Ditolak",
              symbol: getSymbol("red"),
              label: "Ditolak",
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
          url: "https://rdtr.onemap.id/server/rest/services/KDBKLB/KDBKLB_Bangunan/FeatureServer/0",
          renderer: renderer,
          elevationInfo: {
            mode: "on-the-ground",
          },
          title: "Bangunan",
          popupTemplate: {
            // autocasts as new PopupTemplate()
            title: "{status_kdbklb}",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  {
                    fieldName: "status_kdbklb",
                    label: "Status",
                  },
                  {
                    fieldName: "jlh_lantai",
                    label: "Jumlah Lantai",
                  },
                ],
              },
            ],
          },
          outFields: ["status_kdbklb", "jlh_lantai"],
        });

        map.add(buildingsLayer);

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

          // start legend
          const legend = new Legend({
            container: document.createElement("div"),
            view: view,
            layerInfos: [{ layer: buildingsLayer }],
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
        });

        setStateView(view);

        return { view };
      });
      setModules(lModules);
    }
    return () => {
      isMounted = false;
    };
  }, [mapLoaded]);

  // start run analysis
  const handleRunAnalysis = () => {
    Axios.get(
      "https://rdtr.onemap.id/server/rest/services/KDBKLB/KDBKLB_PersilTanah_Pabaton/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=" +
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
          setResultAnalysis(true);
          setResPersilTanah(featuresPersilTanah[0].attributes);
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
      <div style={style.viewDiv} ref={mapRef} />
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
  );
};
const style = {
  viewDiv: {
    padding: 0,
    margin: 0,
    // height: "calc(100vh - 190px)",
    height: "100vh",
    // height: "380px",
    width: "100%",
    fallbacks: [{ width: "-moz-calc(100vh - 110px)" }, { width: "-webkit-calc(100vh - 110px)" }, { width: "-o-calc(100vh - 110px)" }],
  },
};
