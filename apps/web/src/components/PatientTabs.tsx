import { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";

import AllChartsData from "./AllChartsData";
import "./PatientTabs.css";

const tabs = [
  "Overview",
  "Vitals History",
  "Alerts",
  "Recommendations",
  "Thresholds",
];

const PatientTabs = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  const handleClick = (tab: string) => {
    setActiveTab(tab);
    console.log(`${tab} clicked`);
  };

  return (
    <>
      <Box className="patient-tabs-wrapper">
        {tabs.map((tab) => (
          <Button
            key={tab}
            className={`patient-tab-button ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => handleClick(tab)}
          >
            {tab}
          </Button>
        ))}
      </Box>

      <Box mt={6}>
        {activeTab === "Overview" ? (
          <AllChartsData />
        ) : (
          <Box className="tab-placeholder">
            <Text fontSize="xl" fontWeight="600">
              {activeTab} - WIP
            </Text>
          </Box>
        )}
      </Box>
    </>
  );
};

export default PatientTabs;
