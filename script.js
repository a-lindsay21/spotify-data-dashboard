// Load CSV with PapaParse
Papa.parse("spotify_full_1000.csv", {
  download: true,
  header: true,
  complete: function(results) {
    const data = results.data;

// Populate genre dropdowns
const uniqueGenres = [...new Set(data.map(row => row.genre).filter(Boolean))].sort();

const valenceSelect = document.getElementById("valence-genre-select");
const tempoSelect = document.getElementById("tempo-genre-select");

// Add default "All Genres" option
[valenceSelect, tempoSelect].forEach(select => {
  select.innerHTML = '<option value="all">All Genres</option>';
  uniqueGenres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    select.appendChild(option);
  });
});

    buildArtistChart(data);
    buildDanceabilityChart(data);
    buildValenceEnergyChart(data);
    buildPopularityTempoChart(data);
    buildGenreDistributionChart(data);
  }
});

function buildArtistChart(data) {
  // Count how many songs each artist has
  const counts = {};

  data.forEach(row => {
    const artist = row.artist_name;
    if (artist) {
      counts[artist] = (counts[artist] || 0) + 1;
    }
  });

  // Sort by song count, get top 5
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const artists = sorted.map(item => item[0]);
  const songCounts = sorted.map(item => item[1]);

  // Create the chart
  const ctx = document.getElementById("artistChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: artists,
      datasets: [{
        label: "Number of Songs",
        data: songCounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function buildDanceabilityChart(data) {
  const genreData = {};

  data.forEach(row => {
    const genre = row.genre;
    const dance = parseFloat(row.danceability);
    if (genre && !isNaN(dance)) {
      if (!genreData[genre]) {
        genreData[genre] = { total: 0, count: 0 };
      }
      genreData[genre].total += dance;
      genreData[genre].count++;
    }
  });

  const genres = Object.keys(genreData);
  const avgDanceability = genres.map(genre => {
    const { total, count } = genreData[genre];
    return (total / count).toFixed(2);
  });

  const ctx = document.getElementById("danceabilityChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: genres,
      datasets: [{
        label: "Avg. Danceability by Genre",
        data: avgDanceability,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1.0
        }
      }
    }
  });
}

function buildValenceEnergyChart(data) {
  window.updateValenceEnergyChart = updateChart;
    console.log("Genre chart data:", data);
  const genreSelect = document.getElementById("valence-genre-select");

  // Get unique genres
  const genres = [...new Set(data.map(row => row.genre))].sort();

  // Populate dropdown
  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });

  let chart; // This will hold our Chart.js instance

  function updateChart(selectedGenre) {
    const filtered = data.filter(row => {
      return selectedGenre === "all" || row.genre === selectedGenre;
    });

    const points = filtered.map(row => ({
      x: parseFloat(row.valence),
      y: parseFloat(row.energy),
      label: row.track_name
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));

    const ctx = document.getElementById("valenceEnergyChart").getContext("2d");

    // Destroy previous chart if it exists
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [{
          label: selectedGenre === "all" ? "All Songs" : `${selectedGenre} Songs`,
          data: points,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 0.4)",
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const track = context.raw;
                return `${track.label}: Valence ${track.x}, Energy ${track.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: "Valence (Happiness)"
            },
            min: 0,
            max: 1
          },
          y: {
            title: {
              display: true,
              text: "Energy"
            },
            min: 0,
            max: 1
          }
        }
      }
    });
  }

  // Event listener for dropdown change
  genreSelect.addEventListener("change", () => {
    updateChart(genreSelect.value);
  });

  // Initial chart render
  updateChart("all");
}

function buildPopularityTempoChart(data) {
  window.updatePopularityTempoChart = updateChart;
    const genreSelect = document.getElementById("tempo-genre-select");
  let chart;

  function updateChart(selectedGenre) {
    const filtered = data.filter(row => {
      return selectedGenre === "all" || row.genre === selectedGenre;
    });

    const points = filtered.map(row => ({
      x: parseFloat(row.tempo),
      y: parseFloat(row.popularity),
      label: row.track_name
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));

    const ctx = document.getElementById("popularityTempoChart").getContext("2d");

    // Destroy previous chart
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [{
          label: selectedGenre === "all" ? "All Songs" : `${selectedGenre} Songs`,
          data: points,
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const song = context.raw;
                return `${song.label}: Tempo ${song.x} BPM, Popularity ${song.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Tempo (BPM)"
            },
            min: 60,
            max: 200
          },
          y: {
            title: {
              display: true,
              text: "Popularity"
            },
            min: 0,
            max: 100
          }
        }
      }
    });
  }

  genreSelect.addEventListener("change", () => {
    updateChart(genreSelect.value);
  });

  updateChart("all");
}

function buildGenreDistributionChart(data) {
  const genreCounts = {};

  data.forEach(row => {
    const genre = row.genre;
    if (genre) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  });

  const genres = Object.keys(genreCounts);
  const counts = Object.values(genreCounts);

  const ctx = document.getElementById("genreDistributionChart").getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: genres,
      datasets: [{
        label: "Genre Distribution",
        data: counts,
        backgroundColor: genres.map((_, i) =>
          `hsl(${(i * 360 / genres.length)}, 70%, 60%)`
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || "";
              const value = context.parsed;
              return `${label}: ${value} songs`;
            }
          }
        }
      }
    }
  });
}

const searchInput = document.getElementById("search-bar");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  // Filter data based on artist or track name
  const filteredData = window.originalSpotifyData.filter(row => {
    const artist = row.artist_name?.toLowerCase() || "";
    const track = row.track_name?.toLowerCase() || "";
    return artist.includes(query) || track.includes(query);
  });

  // Update both charts
  updateValenceEnergyChart(filteredData);
  updatePopularityTempoChart(filteredData);
});

// Save original dataset globally after CSV is parsed
Papa.parse("spotify_full_1000.csv", {
  download: true,
  header: true,
  complete: function(results) {
    const data = results.data;
    window.originalSpotifyData = data; // 👈 store for global access

    buildArtistChart(data);
    buildDanceabilityChart(data);
    buildValenceEnergyChart(data); // initializes full data view
    buildPopularityTempoChart(data); // initializes full data view
  }
});
