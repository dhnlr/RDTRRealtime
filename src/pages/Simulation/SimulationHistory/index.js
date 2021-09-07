import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";

import { Header, Menu, Footer } from "../../../components";

import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import * as watchUtils from "@arcgis/core/core/watchUtils";

function SimulationHistory() {
  let history = useHistory();


  const mapBeforeDiv = useRef(null);
  const mapAfterDiv = useRef(null);

  useEffect(() => {
    if (mapBeforeDiv.current && mapAfterDiv.current) {
      //   /**
      //    * Initialize application
      //    */
      const map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation",
      });

      const viewBefore = new SceneView(viewOptions(map, mapBeforeDiv, false));

      const viewAfter = new SceneView(viewOptions(map, mapAfterDiv, true));
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
    }
  }, []);

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
