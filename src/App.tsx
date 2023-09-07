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
      text: "Chart.js Bar Chart",
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
}

export function App() {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string }[];
  } | null>(null);

  const [secondChartData, setSecondChartData] = useState<{
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string }[];
  } | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string>("last-7-days");
  const [secondSelectedFilter, setSecondSelectedFilter] =
    useState<string>("last-7-days");

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
              label: "Energy",
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
        // Filter data based on the second selected filter
        const filteredData = filterSecondData(data, secondSelectedFilter);

        // Transform the filtered data into the format expected by Chart.js for the second graph
        const labels = filteredData.map((item) =>
          new Date(item.time * 1000).toLocaleTimeString()
        );
        const loadData = filteredData.map((item) => item.load);

        const secondChartData = {
          labels,
          datasets: [
            {
              label: "Load",
              data: loadData,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        };

        setSecondChartData(secondChartData);
      })
      .catch((error) => {
        console.error("Error fetching second data:", error);
      });
  }, [selectedFilter, secondSelectedFilter]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleSecondFilterChange = (filter: string) => {
    setSecondSelectedFilter(filter);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "45%", marginRight: "5%" }}>
        <select
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
        {chartData ? (
          <Bar options={options} data={chartData} height={300} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div style={{ width: "45%" }}>
        <select
          value={secondSelectedFilter}
          onChange={(e) => handleSecondFilterChange(e.target.value)}
        >
          <option value="last-7-days">Last 7 Days</option>
          <option value="last-30-days">Last 30 Days</option>
          <option value="last-90-days">Last 90 Days</option>
          <option value="last-180-days">Last 180 Days</option>
          <option value="last-365-days">Last 1 Year</option>
          <option value="lifetime">Lifetime</option>
        </select>
        {secondChartData ? (
          <Bar options={options} data={secondChartData} height={300} />
        ) : (
          <p>Loading...</p>
        )}
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
