import styled from "styled-components";
const TabsModule = styled.div`
  overflow: hidden;
  width: 100%;
  height: 85px;
  display: flex;
  box-sizing: border-box;
  justify-content: space-around;
  align-items: center;
  font-size: 12px;
  background: rgb(10, 21, 106);
  color: #878a96;
  border-top: 1px solid rgb(112 120 129);
  }
`;
const TabModuleButton = styled.button`
  border-radius: 50%;
  padding: 1.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2vw;
  height: 2vw;
  font-size: 2vw;
  outline: none;
  border: none;
  background-color: ${(props) => (props.activeTab ? "#050e56" : "#0A156A")};
  color: ${(props) => (props.activeTab ? "white" : "#878A96")};
  transition: background-color 0.5s ease-in-out;
`;
const TabModuleText = styled.span`
  margin-top: 10px;
  cursor: pointer;
  color: ${(props) => (props.activeTab ? "white" : "#878A96")};
  transition: background-color 0.5s ease-in-out;
  }
`;
const TabModuleContent = styled.div`
  ${(props) => (props.activeTab ? "" : "display:none")};
`;
const TabModuleResButton = styled.button`
  padding: 1.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2vw;
  height: 2vw;
  font-size: 2vw;
  outline: none;
  border: none;
  background-color: ${(props) => (props.activeTab ? "#050e56" : "#0A156A")};
  color: ${(props) => (props.activeTab ? "white" : "#878A96")};
  transition: background-color 0.5s ease-in-out;
`;

export { TabsModule, TabModuleButton, TabModuleText, TabModuleContent, TabModuleResButton };
