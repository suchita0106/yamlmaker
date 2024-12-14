import React, { useState, useEffect } from "react";
import yaml from "js-yaml";
import { saveAs } from "file-saver";
import { Layout, Row, Col, Input, Select, Typography, Button } from "antd";
import "antd/dist/reset.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Server IP
const serverIp = import.meta.env.VITE_SERVER_IP || "localhost";
console.log(`Server IP: ${serverIp}`);

const App: React.FC = () => {
  const [yamlContent, setYamlContent] = useState<any>(null);

  // Fetch YAML from the server on component mount
  useEffect(() => {
    const fetchYaml = async () => {
      try {
        const response = await fetch(`http://${serverIp}:5001/get-config`);
        if (response.ok) {
          const yamlText = await response.text();
          const jsonData = yaml.load(yamlText);
          setYamlContent(jsonData);
        } else {
          console.error("Failed to fetch YAML file from server.");
        }
      } catch (error) {
        console.error("Error fetching YAML file:", error);
      }
    };

    fetchYaml();
  }, []);

  // Update YAML content dynamically
  const handleChange = (path: string[], value: any) => {
    const updatedYaml = { ...yamlContent };
    let current = updatedYaml;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setYamlContent(updatedYaml);
  };

  // Render YAML inputs dynamically
  const renderInputs = (obj: any, path: string[] = []) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];

      if (Array.isArray(value)) {
        // Handle arrays
        return (
          <div
            key={currentPath.join(".")}
            style={{
              paddingLeft: "20px",
              borderLeft: "4px solid #4caf50",
              marginBottom: "20px",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#4caf50" }}>{key} (Array):</Text>
            {value.map((item, index) => (
              <div key={`${currentPath.join(".")}[${index}]`} style={{ marginBottom: "10px" }}>
                {typeof item === "object" ? (
                  renderInputs(item, [...currentPath, String(index)])
                ) : (
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleChange([...currentPath, String(index)], e.target.value)
                    }
                    placeholder={`Enter value for ${key}[${index}]`}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            ))}
          </div>
        );
      } else if (typeof value === "object" && value !== null) {
        // Handle nested objects
        return (
          <div
            key={currentPath.join(".")}
            style={{
              paddingLeft: "20px",
              borderLeft: "4px solid #4caf50",
              marginBottom: "20px",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#4caf50" }}>{key}:</Text>
            {renderInputs(value, currentPath)}
          </div>
        );
      } else {
        // Handle primitives
        return (
          <Row
            key={currentPath.join(".")}
            gutter={[16, 16]}
            align="middle"
            style={{ marginBottom: "10px" }}
          >
            <Col span={6}>
              <Text style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                {key}:
              </Text>
            </Col>
            <Col span={18}>
              {typeof value === "boolean" ? (
                <Select
                  value={value ? "true" : "false"}
                  onChange={(val) => handleChange(currentPath, val === "true")}
                  style={{ width: "100%" }}
                >
                  <Option value="true">True</Option>
                  <Option value="false">False</Option>
                </Select>
              ) : (
                <Input
                  value={value as string | number | undefined}
                  onChange={(e) => handleChange(currentPath, e.target.value)}
                  placeholder={`Enter value for ${key}`}
                  style={{ width: "100%" }}
                />
              )}
            </Col>
          </Row>
        );
      }
    });
  };

  // Download updated YAML file
  const handleDownload = () => {
    const yamlStr = yaml.dump(yamlContent);
    const blob = new Blob([yamlStr], { type: "text/yaml;charset=utf-8" });
    saveAs(blob, "updated-config.yaml");
  };

  // Deploy updated YAML to the server
  const handleDeploy = async () => {
    try {
      const yamlStr = yaml.dump(yamlContent);
      const response = await fetch(`http://${serverIp}:5001/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ yamlContent: yamlStr }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Deployed Successfully: ${result.message}`);
      } else {
        alert("Failed to deploy YAML file.");
      }
    } catch (error) {
      console.error("Error during deployment:", error);
      alert("Error during deployment. Check the console for details.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <Content
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          overflowY: "auto",
        }}
      >
        <Title level={3} style={{ textAlign: "center", color: "#4caf50" }}>
          Dynamic YAML Editor
        </Title>
        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
          {yamlContent ? renderInputs(yamlContent) : <p>Loading YAML...</p>}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button type="primary" onClick={handleDownload} style={{ marginRight: "10px" }}>
            Download YAML
          </Button>
          <Button type="primary" onClick={handleDeploy} style={{ marginLeft: "10px" }}>
            Deploy YAML
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default App;