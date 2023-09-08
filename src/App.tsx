import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./App.css"; // Import your custom CSS for styling

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Energy Consumption",
      font: {
        size: 16,
        weight: "bold",
      },
    },
  },
};

interface DataItem {
  time: number;
  energy: number;
}

interface SecondDataItem {
  time: number;
  load: number;
  solar: number;
  grid: number;
}

export function App() {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string }[];
  } | null>(null); // Initialize with null

  const [secondChartData, setSecondChartData] = useState<{
    labels: number[]; // Use numerical labels
    datasets: { label: string; data: number[]; backgroundColor: string }[];
  } | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string>("last-7-days");
  const [secondSelectedFilters, setSecondSelectedFilters] = useState<string[]>([
    "load",
  ]);

  useEffect(() => {
    // Fetch data from the first API
    fetch(
      "https://7yakqpu4vl.execute-api.ap-south-1.amazonaws.com/alpha/getdata"
    )
      .then((response) => response.json())
      .then((data: DataItem[]) => {
        // Filter data based on the selected filter
        const filteredData = filterData(data, selectedFilter);

        // Transform the filtered data into the format expected by Chart.js
        const labels = filteredData.map((item: DataItem) =>
          new Date(item.time * 1000).toLocaleDateString()
        );
        const energyData = filteredData.map((item: DataItem) => item.energy);

        const chartData = {
          labels,
          datasets: [
            {
              label: "Energy Consumption (kWh)",
              data: energyData,
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        };

        setChartData(chartData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    // Fetch data from the second API
    fetch(
      "https://7yakqpu4vl.execute-api.ap-south-1.amazonaws.com/alpha/getconsumptiondata?start=1692316800&end=1692403200"
    )
      .then((response) => response.json())
      .then((data: SecondDataItem[]) => {
        // Transform the data into an object with load, solar, and grid arrays
        const filteredData = {
          load: filterSecondData(data, "load"),
          solar: filterSecondData(data, "solar"),
          grid: filterSecondData(data, "grid"),
        };

        // Generate labels (numerical) for the x-axis
        const labels = filteredData.load.map((_item, index) => index + 1);

        // Generate datasets based on selected checkboxes
        const datasets = [];
        if (secondSelectedFilters.includes("load")) {
          datasets.push({
            label: "Load (kW)",
            data: filteredData.load.map((item) => item.load),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          });
        }
        if (secondSelectedFilters.includes("solar")) {
          datasets.push({
            label: "Solar (kW)",
            data: filteredData.solar.map((item) => item.solar),
            backgroundColor: "rgba(255, 206, 86, 0.5)",
          });
        }
        if (secondSelectedFilters.includes("grid")) {
          datasets.push({
            label: "Grid (kW)",
            data: filteredData.grid.map((item) => item.grid),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          });
        }

        const secondChartData = {
          labels,
          datasets,
        };

        setSecondChartData(secondChartData);
      })
      .catch((error) => {
        console.error("Error fetching second data:", error);
      });
  }, [selectedFilter, secondSelectedFilters]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleSecondFilterChange = (filter: string) => {
    if (secondSelectedFilters.includes(filter)) {
      // If the filter is already selected, remove it
      setSecondSelectedFilters(
        secondSelectedFilters.filter((f) => f !== filter)
      );
    } else {
      // If the filter is not selected, add it
      setSecondSelectedFilters([...secondSelectedFilters, filter]);
    }
  };

  return (
    <div className="app-container">
      <header className="top-nav">
        <h1>Energy Dashboard</h1>
      </header>
      <div className="graph-container">
        <div className="graph">
          {chartData ? (
            <>
              <select
                className="energy-dropdown"
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="last-180-days">Last 180 Days</option>
                <option value="last-365-days">Last 1 Year</option>
                <option value="lifetime">Lifetime</option>
              </select>
              <Bar options={options} data={chartData} height={100} />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="graph">
          {secondChartData ? (
            <div>
              <div className="checkbox-container">
                <label>
                  <input
                    type="checkbox"
                    value="load"
                    checked={secondSelectedFilters.includes("load")}
                    onChange={() => handleSecondFilterChange("load")}
                  />
                  Load
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="solar"
                    checked={secondSelectedFilters.includes("solar")}
                    onChange={() => handleSecondFilterChange("solar")}
                  />
                  Solar
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="grid"
                    checked={secondSelectedFilters.includes("grid")}
                    onChange={() => handleSecondFilterChange("grid")}
                  />
                  Grid
                </label>
              </div>
              <Bar options={options} data={secondChartData} height={100} />
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function filterData(data: DataItem[], filter: string): DataItem[] {
  const now = new Date().getTime() / 1000; // Current timestamp in seconds

  switch (filter) {
    case "last-7-days":
      return data.filter((item) => now - item.time <= 7 * 24 * 3600);
    case "last-30-days":
      return data.filter((item) => now - item.time <= 30 * 24 * 3600);
    case "last-90-days":
      return data.filter((item) => now - item.time <= 90 * 24 * 3600);
    case "last-180-days":
      return data.filter((item) => now - item.time <= 180 * 24 * 3600);
    case "last-365-days":
      return data.filter((item) => now - item.time <= 365 * 24 * 3600);
    case "lifetime":
    default:
      return data;
  }
}

function filterSecondData(
  data: SecondDataItem[],
  filter: string
): SecondDataItem[] {
  switch (filter) {
    case "load":
      return data;
    case "solar":
      return data;
    case "grid":
      return data;
    default:
      return [];
  }
}
