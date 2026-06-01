const kpiData = [
  {
    label: "Journals",
    value: "145",
    note: "Across four disciplinary areas",
    detail: "Journals"
  },
  {
    label: "Manuscripts",
    value: "348,118",
    note: "Submission records included in the analysis",
    detail: "Manuscripts"
  },
  {
    label: "Authors",
    value: "1,689,944",
    note: "Total author appearances across manuscripts",
    detail: "Authors"
  },
  {
    label: "Review records",
    value: "745,693",
    note: "First-round referee assignments",
    detail: "Reviews"
  },
  {
    label: "Main period",
    value: "2010-2016",
    note: "Includes a small number of 2008-2009 records",
    detail: "Main period"
  },
  {
    label: "Checkpoints",
    value: "3",
    note: "Reviewer selection, recommendations, decisions",
    detail: "Bias checkpoints"
  }
];

const dumbbellData = [
  {
    field: "Biomedicine & health sciences",
    label: "Biomedicine & health",
    manuscripts: 113421,
    journals: 55,
    femaleAuthors: 31.5,
    femaleReviewers: 24.6
  },
  {
    field: "Life sciences",
    label: "Life sciences",
    manuscripts: 31331,
    journals: 24,
    femaleAuthors: 27.7,
    femaleReviewers: 21.0
  },
  {
    field: "Physical sciences",
    label: "Physical sciences",
    manuscripts: 184315,
    journals: 50,
    femaleAuthors: 19.1,
    femaleReviewers: 16.3
  },
  {
    field: "Social sciences & humanities",
    label: "Social sciences & humanities",
    manuscripts: 19051,
    journals: 16,
    femaleAuthors: 38.0,
    femaleReviewers: 38.1
  }
];

const colors = {
  teal: "#3CAC3B",
  gold: "#e8a020",
  author: "#3CAC3B",
  reviewer: "#e8a020",
  ink: "#f2f2f0",
  moss: "#2A398D",
  muted: "rgba(251,251,246,.72)"
};

const bPaths = {
  sankey: "B部分/B-ͼ1/data/peer_review_sankey.json",
  dot: "B部分/B-ͼ2/data/acceptance_by_author_group_area.json",
  recommendation: "B部分/B-ͼ2/data/recommendation_by_author_group_area.csv"
};

const rPath = "R部分/data/desk_rejection_by_author_group_area.csv";

const bStageNames = {
  "Submission": "Submission",
  "Peer Review Type": "Review Type",
  "Desk Screening": "Initial Check",
  "Reviewer Count": "Reviewers",
  "Review Score": "Review Score",
  "Review Rounds": "Revision Rounds",
  "Editorial Recommendation": "Editor Recommendation",
  "Final Decision": "Final Decision"
};

const bStageColors = {
  "Submission": "#C06C9A",
  "Peer Review Type": "#B8A4D4",
  "Desk Screening": "#9DBFE1",
  "Reviewer Count": "#89BFA1",
  "Review Score": "#C5CF78",
  "Review Rounds": "#EDBE75",
  "Editorial Recommendation": "#EDA57E",
  "Final Decision": "#F28B58"
};

const bDotColors = {
  "Solo man": "#6fb8e4",
  "Solo woman": "#df6f9f",
  "All men team": "#927ae2",
  "All women team": "#ef9b57",
  "Cross collaboration": "#5cb3ad"
};

const recOrder = ["Accept", "Minor revisions", "Major revisions"];

const recColors = {
  "Accept": "#65c96a",
  "Minor revisions": "#5f8ff0",
  "Major revisions": "#e8a020"
};

let bSankeyCache = null;
let bDotCache = null;
let bRecommendationCache = null;
let rDeskRejectionCache = null;

const cPaths = {
  prediction: "C部分/figure5/data/figure5_prediction_long.csv",
  validation: "C部分/figure5/data/figure5_bntest_grouped.csv"
};

const cDisciplines = [
  "Biomedicine & health sciences",
  "Life sciences",
  "Physical sciences",
  "Social sciences & humanities"
];

const cDisciplineLabels = new Map([
  ["Biomedicine & health sciences", "Biomedicine & health"],
  ["Life sciences", "Life sciences"],
  ["Physical sciences", "Physical sciences"],
  ["Social sciences & humanities", "Social sciences & humanities"]
]);

const cAuthorColors = new Map([
  ["all men", "#5f8ff0"],
  ["all women", "#e06272"]
]);

let cPredictionCache = null;
let cValidationCache = null;

function renderKpis() {
  const container = document.querySelector("#kpi-grid");
  if (!container) return;

  container.innerHTML = kpiData
    .map(
      (item) => `
        <article class="metric">
          <span>${item.label}</span>
          <strong data-kpi-value="${item.value}">${item.value.includes("-") ? item.value : "0"}</strong>
          <small>${item.note}</small>
          <em>${item.detail}</em>
        </article>
      `
    )
    .join("");
}

function formatKpiNumber(value) {
  return Math.round(value).toLocaleString("en-US");
}

function animateKpis() {
  const values = document.querySelectorAll("[data-kpi-value]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  values.forEach((node) => {
    const finalText = node.dataset.kpiValue;
    if (node.dataset.animated === "true") return;
    node.dataset.animated = "true";

    if (finalText.includes("-")) {
      node.textContent = finalText;
      return;
    }

    const target = Number(finalText.replace(/,/g, ""));
    if (!Number.isFinite(target)) {
      node.textContent = finalText;
      return;
    }

    if (prefersReducedMotion) {
      node.textContent = finalText;
      return;
    }

    const duration = 1250;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      node.textContent = formatKpiNumber(target * easeOut(progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        node.textContent = finalText;
      }
    }

    requestAnimationFrame(tick);
  });
}

function setupKpiObserver() {
  const overview = document.querySelector("#overview");
  if (!overview) return;

  if (!("IntersectionObserver" in window)) {
    animateKpis();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateKpis();
        observer.disconnect();
      }
    },
    { threshold: 0.35 }
  );

  observer.observe(overview);
}

function setupMethodAccordions() {
  document.querySelectorAll(".method-card").forEach((card) => {
    const toggle = card.querySelector(".method-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const isOpen = card.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function renderDumbbellChart() {
  const container = d3.select("#dumbbell-chart");
  if (container.empty()) return;

  container.selectAll("*").remove();

  const containerNode = container.node();
  const width = Math.max(containerNode.clientWidth, 720);
  const height = 430;
  const margin = { top: 44, right: 104, bottom: 70, left: 176 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("role", "img")
    .attr("aria-label", "Female authors and female referees by field");

  const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 45]).range([0, innerWidth]);
  const y = d3
    .scalePoint()
    .domain(dumbbellData.map((d) => d.label))
    .range([18, innerHeight - 18])
    .padding(0.45);

  chart
    .append("g")
    .attr("class", "grid")
    .call(d3.axisBottom(x).ticks(5).tickSize(innerHeight).tickFormat(""))
    .call((g) => g.select(".domain").remove());

  chart
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat((d) => `${d}%`));

  chart.append("g").attr("class", "axis").call(d3.axisLeft(y).tickSize(0)).call((g) => g.select(".domain").remove());

  const rows = chart
    .append("g")
    .selectAll("g")
    .data(dumbbellData)
    .join("g")
    .attr("class", "dumbbell-row")
    .attr("transform", (d) => `translate(0,${y(d.label)})`);

  rows
    .append("line")
    .attr("x1", (d) => x(d.femaleReviewers))
    .attr("x2", (d) => x(d.femaleAuthors))
    .attr("stroke", "rgba(251,251,246,.32)")
    .attr("stroke-width", 5)
    .attr("stroke-linecap", "round");

  rows
    .append("circle")
    .attr("class", "author-dot")
    .attr("cx", (d) => x(d.femaleAuthors))
    .attr("r", 8);

  rows
    .append("circle")
    .attr("class", "reviewer-dot")
    .attr("cx", (d) => x(d.femaleReviewers))
    .attr("r", 8);

  rows
    .append("text")
    .attr("class", "value-label author-label")
    .attr("x", (d) => x(d.femaleAuthors) + 13)
    .attr("y", -11)
    .text((d) => `${d.femaleAuthors.toFixed(1)}%`);

  rows
    .append("text")
    .attr("class", "value-label reviewer-label")
    .attr("x", (d) => x(d.femaleReviewers) + 13)
    .attr("y", 21)
    .text((d) => `${d.femaleReviewers.toFixed(1)}%`);

  rows
    .append("text")
    .attr("class", "gap-label")
    .attr("x", innerWidth + 22)
    .attr("y", 5)
    .text((d) => {
      const gap = d.femaleReviewers - d.femaleAuthors;
      return `${gap > 0 ? "+" : ""}${gap.toFixed(1)} pts`;
    });

  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .text("Percentage of women authors and referees");

  svg
    .append("text")
    .attr("class", "gap-title")
    .attr("x", margin.left + innerWidth + 22)
    .attr("y", 28)
    .text("Reviewer - author");
}

const rGroupIconMap = new Map([
  ["Solo man", ["man"]],
  ["Solo woman", ["woman"]],
  ["All men team", ["man", "man"]],
  ["All women team", ["woman", "woman"]],
  ["Cross collaboration", ["woman", "man"]]
]);

const rGroupDisplay = new Map([
  ["Solo man", "Solo man"],
  ["Solo woman", "Solo woman"],
  ["All men team", "All-men team"],
  ["All women team", "All-women team"],
  ["Cross collaboration", "Mixed-gender team"]
]);

const recGroupDisplay = new Map([
  ["Solo man", "Solo man"],
  ["Solo woman", "Solo woman"],
  ["All men team", "Men team"],
  ["All women team", "Women team"],
  ["Cross collaboration", "Mixed team"]
]);

function rPercent(value) {
  return d3.format(".1%")(value);
}

function rNumber(value) {
  return d3.format(",")(value);
}

function drawRPerson(group, type, x, y, size) {
  return group
    .append("image")
    .attr("class", "r-person")
    .attr("href", type === "woman" ? "R部分/women-restroom.svg" : "R部分/men-restroom.svg")
    .attr("x", x)
    .attr("y", y)
    .attr("width", size)
    .attr("height", size)
    .attr("preserveAspectRatio", "xMidYMid meet");
}

function showRTooltip(event, d) {
  d3.select("#r-tooltip")
    .html(`
      <strong>${rGroupDisplay.get(d.author_group) || d.author_group}</strong>
      <span>${d.area}</span><br/>
      Desk rejection rate: ${rPercent(d.desk_rejection_rate)}<br/>
      Desk rejected: ${rNumber(d.desk_rejected)}<br/>
      Manuscripts: ${rNumber(d.manuscripts)}<br/>
      Discipline average: ${rPercent(d.area_desk_rejection_rate)}
    `)
    .style("left", `${event.pageX}px`)
    .style("top", `${event.pageY}px`)
    .style("opacity", 1);
}

function hideRTooltip() {
  d3.select("#r-tooltip").style("opacity", 0);
}

function renderDeskRejectionChart(data) {
  const container = d3.select("#desk-rejection-chart");
  if (container.empty()) return;

  container.selectAll("*").remove();

  const width = Math.max(container.node().clientWidth, 1120);
  const rowHeight = 148;
  const margin = { top: 92, right: 86, bottom: 76, left: 238 };
  const areas = cDisciplines.filter((area) => data.some((d) => d.area === area));
  const authorGroups = Array.from(rGroupIconMap.keys());
  const height = margin.top + margin.bottom + rowHeight * areas.length;
  const totalRejected = d3.sum(data, (d) => d.desk_rejected);
  const totalManuscripts = d3.sum(data, (d) => d.manuscripts);
  const averageRate = totalRejected / totalManuscripts;

  d3.select("#r-average-chip").text(`Overall ${rPercent(averageRate)}`);

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const x = d3.scaleLinear()
    .domain([0.32, 0.58])
    .range([margin.left, width - margin.right]);

  const y = d3.scalePoint()
    .domain(areas)
    .range([margin.top, height - margin.bottom])
    .padding(0.5);

  const groupOffset = d3.scalePoint()
    .domain(authorGroups)
    .range([-46, 46])
    .padding(0.4);

  svg.append("g")
    .attr("class", "grid r-grid")
    .attr("transform", `translate(0,${margin.top - 42})`)
    .call(d3.axisTop(x).ticks(7).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .call((g) => g.select(".domain").remove());

  svg.append("g")
    .attr("class", "axis r-axis")
    .attr("transform", `translate(0,${margin.top - 42})`)
    .call(d3.axisTop(x).ticks(7).tickFormat(d3.format(".0%")));

  svg.append("text")
    .attr("class", "axis-title r-axis-label")
    .attr("x", x(0.58))
    .attr("y", margin.top - 70)
    .attr("text-anchor", "end")
    .text("Desk rejection rate");

  const areaSummary = Array.from(
    d3.rollup(
      data,
      (rows) => rows[0],
      (d) => d.area
    ).values()
  );

  const lanes = svg.append("g")
    .selectAll("g.r-lane")
    .data(areaSummary)
    .join("g")
    .attr("class", "r-lane")
    .attr("transform", (d) => `translate(0,${y(d.area)})`);

  lanes.append("rect")
    .attr("class", "r-row-bg")
    .attr("x", 18)
    .attr("y", -64)
    .attr("width", width - 36)
    .attr("height", 128)
    .attr("rx", 14);

  lanes.append("text")
    .attr("class", "r-discipline-label")
    .attr("x", 44)
    .attr("y", -10)
    .text((d) => cDisciplineLabels.get(d.area) || d.area);

  lanes.append("text")
    .attr("class", "r-group-meta")
    .attr("x", 44)
    .attr("y", 17)
    .text((d) => `Discipline avg ${rPercent(d.area_desk_rejection_rate)}`);

  lanes.append("line")
    .attr("class", "r-avg-line")
    .attr("x1", (d) => x(d.area_desk_rejection_rate))
    .attr("x2", (d) => x(d.area_desk_rejection_rate))
    .attr("y1", -51)
    .attr("y2", 51);

  lanes.append("text")
    .attr("class", "r-avg-label")
    .attr("x", (d) => x(d.area_desk_rejection_rate) + 8)
    .attr("y", 57)
    .text((d) => rPercent(d.area_desk_rejection_rate));

  const marks = svg.append("g")
    .selectAll("g.r-mark")
    .data(data)
    .join("g")
    .attr("class", "r-mark")
    .attr("transform", (d) => `translate(${x(d.desk_rejection_rate)},${y(d.area) + (groupOffset(d.author_group) || 0)})`)
    .on("mousemove", showRTooltip)
    .on("mouseleave", hideRTooltip);

  marks.append("line")
    .attr("class", "r-lollipop-stem")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", 24);

  marks.each(function (d) {
    const mark = d3.select(this);
    const icons = rGroupIconMap.get(d.author_group) || ["man"];
    const iconSize = 28;
    const gap = 18;
    const totalWidth = iconSize + Math.max(0, icons.length - 1) * gap;
    const baseX = -totalWidth / 2;
    const baseY = -18;

    icons.forEach((type, i) => {
      drawRPerson(mark, type, baseX + i * gap, baseY, iconSize);
    });
  });

  marks.append("circle")
    .attr("class", "r-rate-dot")
    .attr("cx", 0)
    .attr("cy", 24)
    .attr("r", 4.5);

  marks.append("text")
    .attr("class", "r-rate-label")
    .attr("x", 10)
    .attr("y", 30)
    .text((d) => rPercent(d.desk_rejection_rate));

  const legend = svg.append("g")
    .attr("class", "r-icon-legend")
    .attr("transform", `translate(${margin.left},${margin.top - 18})`);

  let legendX = 0;
  authorGroups.forEach((groupName) => {
    const item = legend.append("g").attr("transform", `translate(${legendX},0)`);
    const icons = rGroupIconMap.get(groupName) || ["man"];
    icons.forEach((type, index) => {
      drawRPerson(item, type, index * 13, -16, 20);
    });
    item.append("text")
      .attr("class", "r-legend-label")
      .attr("x", icons.length === 1 ? 26 : 42)
      .attr("y", 0)
      .text(rGroupDisplay.get(groupName) || groupName);
    legendX += groupName === "Cross collaboration" ? 190 : 155;
  });
}

async function loadDeskRejectionChart() {
  try {
    rDeskRejectionCache = await d3.csv(rPath, (d) => ({
      author_group: d.author_group,
      area: d.area,
      manuscripts: +d.manuscripts,
      desk_rejected: +d.desk_rejected,
      desk_rejection_rate: +d.desk_rejection_rate,
      area_manuscripts: +d.area_manuscripts,
      area_desk_rejected: +d.area_desk_rejected,
      area_desk_rejection_rate: +d.area_desk_rejection_rate
    }));
    rDeskRejectionCache.sort((a, b) => {
      const areaOrder = d3.ascending(cDisciplines.indexOf(a.area), cDisciplines.indexOf(b.area));
      if (areaOrder !== 0) return areaOrder;
      return d3.ascending(Array.from(rGroupIconMap.keys()).indexOf(a.author_group), Array.from(rGroupIconMap.keys()).indexOf(b.author_group));
    });
    renderDeskRejectionChart(rDeskRejectionCache);
  } catch (error) {
    showBError("#desk-rejection-chart", `Open this page through a local server and confirm that <code>${rPath}</code> exists.`);
    console.error(error);
  }
}

function getBStage(nodeName) {
  return nodeName.split(":")[0].trim();
}

function getBRawLabel(nodeName) {
  const parts = nodeName.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : nodeName;
}

function cleanBLabel(nodeName) {
  const stage = getBStage(nodeName);
  const raw = getBRawLabel(nodeName);

  if (stage === "Submission" && raw === "Submitted") return "Submitted";
  if (stage === "Final Decision" && raw === "Accepted") return "Accepted";
  if (stage === "Final Decision" && raw === "Rejected") return "Rejected";

  return raw
    .replace("Sent to Review", "Sent to Review")
    .replace("Desk Rejected", "Desk Rejected")
    .replace(/\s+/g, " ")
    .trim();
}

function formatBNumber(value) {
  return d3.format(",")(value || 0);
}

function showBTooltip(event, html) {
  d3.select("#b-tooltip")
    .html(html)
    .style("left", `${event.pageX}px`)
    .style("top", `${event.pageY}px`)
    .style("opacity", 1);
}

function hideBTooltip() {
  d3.select("#b-tooltip").style("opacity", 0);
}

function renderBSankey(data) {
  const container = d3.select("#b-sankey-chart");
  if (container.empty() || !window.d3.sankey) return;

  container.selectAll("*").remove();

  const width = Math.max(container.node().clientWidth, 1180);
  const height = 720;
  const margin = { top: 66, right: 150, bottom: 36, left: 154 };

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const sankey = d3.sankey()
    .nodeWidth(24)
    .nodePadding(18)
    .nodeAlign(d3.sankeyJustify)
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom]
    ]);

  const graph = sankey({
    nodes: data.nodes.map((d) => ({ ...d })),
    links: data.links.map((d) => ({ ...d }))
  });

  const defs = svg.append("defs");

  graph.links.forEach((link, i) => {
    const gradient = defs
      .append("linearGradient")
      .attr("id", `b-sankey-gradient-${i}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", link.source.x1)
      .attr("x2", link.target.x0)
      .attr("y1", (link.y0 + link.y1) / 2)
      .attr("y2", (link.y0 + link.y1) / 2);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", bStageColors[getBStage(link.source.name)] || colors.moss)
      .attr("stop-opacity", 0.48);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", bStageColors[getBStage(link.target.name)] || colors.teal)
      .attr("stop-opacity", 0.72);
  });

  svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("class", "b-sankey-link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", (_, i) => `url(#b-sankey-gradient-${i})`)
    .attr("stroke-width", (d) => Math.max(1.4, d.width))
    .on("mousemove", function (event, d) {
      d3.select(this).raise().classed("is-active", true);
      showBTooltip(event, `
        <strong>${cleanBLabel(d.source.name)} -> ${cleanBLabel(d.target.name)}</strong>
        <span>${bStageNames[getBStage(d.source.name)] || getBStage(d.source.name)} to ${bStageNames[getBStage(d.target.name)] || getBStage(d.target.name)}</span><br/>
        Manuscripts: ${formatBNumber(d.value)}
      `);
    })
    .on("mouseleave", function () {
      d3.select(this).classed("is-active", false);
      hideBTooltip();
    });

  const node = svg.append("g")
    .selectAll("g")
    .data(graph.nodes)
    .join("g")
    .attr("class", "b-sankey-node");

  node.append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => Math.max(4, d.y1 - d.y0))
    .attr("width", (d) => d.x1 - d.x0)
    .attr("fill", (d) => bStageColors[getBStage(d.name)] || colors.moss)
    .on("mousemove", (event, d) => {
      showBTooltip(event, `
        <strong>${cleanBLabel(d.name)}</strong>
        <span>${bStageNames[getBStage(d.name)] || getBStage(d.name)}</span><br/>
        Manuscripts: ${formatBNumber(d.value)}
      `);
    })
    .on("mouseleave", hideBTooltip);

  node.append("text")
    .attr("x", (d) => d.x0 - 12)
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => {
      const label = cleanBLabel(d.name);
      return label === "Submitted" ? "" : label;
    })
    .call(wrapBText, 120);

  const stageData = d3.rollups(
    graph.nodes,
    (values) => {
      const stage = getBStage(values[0].name);
      return {
        stage,
        label: bStageNames[stage] || stage,
        x: d3.mean(values, (d) => (d.x0 + d.x1) / 2)
      };
    },
    (d) => getBStage(d.name)
  ).map((d) => d[1]);

  svg.append("g")
    .selectAll("text")
    .data(stageData)
    .join("text")
    .attr("class", "b-stage-label")
    .attr("x", (d) => d.x)
    .attr("y", 34)
    .attr("text-anchor", "middle")
    .attr("fill", (d) => bStageColors[d.stage] || colors.ink)
    .text((d) => d.label);
}

function wrapBText(text, width) {
  text.each(function () {
    const textNode = d3.select(this);
    const words = textNode.text().split(/\s+/).reverse();
    const x = textNode.attr("x");
    const y = textNode.attr("y");
    const dy = parseFloat(textNode.attr("dy")) || 0;
    let line = [];
    let lineNumber = 0;
    let word;

    textNode.text(null);
    let tspan = textNode.append("tspan").attr("x", x).attr("y", y).attr("dy", `${dy}em`);

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textNode
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", `${++lineNumber * 1.12 + dy}em`)
          .text(word);
      }
    }
  });
}

function renderBDotLegend(authorGroups) {
  const legend = d3.select("#b-dot-legend");
  if (legend.empty()) return;

  legend.selectAll("*").remove();
  legend
    .selectAll("span")
    .data(authorGroups)
    .join("span")
    .attr("class", "dot-legend-item")
    .html((d) => `<i style="background:${bDotColors[d.author_group] || colors.moss}"></i>${d.author_group_label}`);
}

function renderRecommendationLegend() {
  const legend = d3.select("#rec-legend");
  if (legend.empty()) return;

  legend.html(`
    <span>Lower positive share</span>
    <i aria-hidden="true"></i>
    <span>Higher positive share</span>
  `);
}

function renderRecommendationChart(data) {
  const container = d3.select("#recommendation-chart");
  if (container.empty()) return;

  container.selectAll("*").remove();
  renderRecommendationLegend();

  const width = Math.max(container.node().clientWidth, 1280);
  const margin = { top: 92, right: 74, bottom: 86, left: 380 };
  const areas = cDisciplines.filter((area) => data.some((d) => d.area === area));
  const authorGroups = Array.from(rGroupIconMap.keys());
  const innerWidth = width - margin.left - margin.right;
  const cellGap = 12;
  const cellWidth = (innerWidth - cellGap * (authorGroups.length - 1)) / authorGroups.length;
  const cellHeight = 86;
  const height = margin.top + margin.bottom + areas.length * cellHeight + (areas.length - 1) * cellGap;

  const nested = d3.group(data, (d) => d.area, (d) => d.author_group);
  const rows = [];
  areas.forEach((area) => {
    authorGroups.forEach((group) => {
      const values = nested.get(area)?.get(group) || [];
      const byRec = new Map(values.map((d) => [d.recommendation, d]));
      const accept = byRec.get("Accept") || { count: 0, share: 0, total: values[0]?.total || 0 };
      const minor = byRec.get("Minor revisions") || { count: 0, share: 0, total: values[0]?.total || 0 };
      const major = byRec.get("Major revisions") || { count: 0, share: 0, total: values[0]?.total || 0 };
      const total = values[0]?.total || accept.total || minor.total || major.total || 0;
      rows.push({
        area,
        author_group: group,
        total,
        accept_count: accept.count,
        minor_count: minor.count,
        major_count: major.count,
        accept_share: accept.share,
        minor_share: minor.share,
        major_share: major.share,
        positive_share: accept.share + minor.share
      });
    });
  });

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const x = d3.scaleBand()
    .domain(authorGroups)
    .range([margin.left, width - margin.right])
    .paddingInner(0.07);

  const y = d3.scaleBand()
    .domain(areas)
    .range([margin.top, height - margin.bottom])
    .paddingInner(0.14);

  const color = d3.scaleSequential()
    .domain(d3.extent(rows, (d) => d.positive_share))
    .interpolator(d3.interpolateRgbBasis(["#14171d", "#27486f", "#3d8bc4", "#65c96a"]));

  const defs = svg.append("defs");
  const filter = defs.append("filter").attr("id", "rec-tile-glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
  filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
  filter.append("feMerge")
    .selectAll("feMergeNode")
    .data(["blur", "SourceGraphic"])
    .join("feMergeNode")
    .attr("in", (d) => d);

  svg.append("g")
    .attr("class", "rec-column-labels")
    .selectAll("text")
    .data(authorGroups)
    .join("text")
    .attr("x", (d) => x(d) + x.bandwidth() / 2)
    .attr("y", margin.top - 30)
    .attr("text-anchor", "middle")
    .text((d) => recGroupDisplay.get(d) || d);

  const lanes = svg.append("g")
    .selectAll("g.rec-lane")
    .data(areas)
    .join("g")
    .attr("class", "rec-lane")
    .attr("transform", (d) => `translate(0,${y(d)})`);

  lanes.append("rect")
    .attr("class", "r-row-bg")
    .attr("x", 18)
    .attr("y", 0)
    .attr("width", width - 36)
    .attr("height", y.bandwidth())
    .attr("rx", 14);

  lanes.append("text")
    .attr("class", "r-discipline-label")
    .attr("x", 44)
    .attr("y", 32)
    .text((d) => cDisciplineLabels.get(d) || d);

  lanes.append("text")
    .attr("class", "r-group-meta")
    .attr("x", 44)
    .attr("y", 56)
    .text("Accept + minor revision");

  const cells = svg.append("g")
    .selectAll("g.rec-cell")
    .data(rows)
    .join("g")
    .attr("class", "rec-cell")
    .attr("transform", (d) => `translate(${x(d.author_group)},${y(d.area)})`);

  cells.append("rect")
    .attr("class", "rec-tile")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("rx", 10)
    .attr("fill", (d) => color(d.positive_share))
    .on("mousemove", function (event, d) {
      d3.select(this).classed("is-active", true);
      showBTooltip(event, `
        <strong>${d3.format(".1%")(d.positive_share)} positive recommendation</strong>
        <span>${d.area} · ${rGroupDisplay.get(d.author_group) || d.author_group}</span><br/>
        Accept: ${d3.format(".1%")(d.accept_share)} · Minor revisions: ${d3.format(".1%")(d.minor_share)}<br/>
        Major revisions: ${d3.format(".1%")(d.major_share)}<br/>
        Manuscripts sent to review: ${formatBNumber(d.total)}
      `);
    })
    .on("mouseleave", function () {
      d3.select(this).classed("is-active", false);
      hideBTooltip();
    });

  cells.append("text")
    .attr("class", "rec-heat-value")
    .attr("x", x.bandwidth() / 2)
    .attr("y", y.bandwidth() / 2 - 3)
    .attr("text-anchor", "middle")
    .text((d) => d3.format(".1%")(d.positive_share));

  cells.append("text")
    .attr("class", "rec-heat-sub")
    .attr("x", x.bandwidth() / 2)
    .attr("y", y.bandwidth() / 2 + 20)
    .attr("text-anchor", "middle")
    .text((d) => `n=${d3.format(",")(d.total)}`);
}

function renderBDotPlot(data) {
  const container = d3.select("#b-dot-chart");
  if (container.empty()) return;

  container.selectAll("*").remove();

  const records = data.records.slice();
  const areas = data.areas.slice();
  const authorGroups = data.author_groups
    .slice()
    .sort((a, b) => d3.ascending(a.group_order, b.group_order));

  renderBDotLegend(authorGroups);

  const width = Math.max(container.node().clientWidth, 1120);
  const height = 650;
  const margin = { top: 42, right: 46, bottom: 112, left: 78 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const x = d3.scalePoint().domain(areas).range([margin.left, width - margin.right]).padding(0.55);
  const groupOffset = d3
    .scalePoint()
    .domain(authorGroups.map((d) => d.author_group))
    .range([-84, 84])
    .padding(0.5);
  const y = d3.scaleLinear().domain([0.2, 0.7]).nice().range([height - margin.bottom, margin.top]);
  const r = d3
    .scaleSqrt()
    .domain(d3.extent(records, (d) => d.manuscripts))
    .range([5, 24]);

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(y.ticks(6))
    .join("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d));

  svg.append("g")
    .attr("class", "b-discipline-guides")
    .selectAll("line")
    .data(areas)
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", margin.top)
    .attr("y2", height - margin.bottom);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".0%")))
    .call((g) => g.select(".domain").remove());

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .attr("dy", "1.1em")
    .call(wrapBText, Math.max(84, innerWidth / areas.length - 18));

  svg.append("text")
    .attr("class", "axis-title")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 24)
    .attr("text-anchor", "middle")
    .text("Discipline");

  svg.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + innerHeight / 2))
    .attr("y", 24)
    .attr("text-anchor", "middle")
    .text("Acceptance Rate");

  svg.append("g")
    .selectAll("circle")
    .data(records)
    .join("circle")
    .attr("class", "b-dot")
    .attr("cx", (d) => x(d.area) + (groupOffset(d.author_group) || 0))
    .attr("cy", (d) => y(d.acceptance_rate))
    .attr("r", (d) => r(d.manuscripts))
    .attr("fill", (d) => bDotColors[d.author_group] || colors.moss)
    .on("mousemove", function (event, d) {
      d3.select(this).raise().classed("is-active", true);
      showBTooltip(event, `
        <strong>${d.author_group_label}</strong>
        <span>${d.area}</span><br/>
        Acceptance rate: ${d3.format(".1%")(d.acceptance_rate)}<br/>
        Accepted: ${formatBNumber(d.accepted)} / ${formatBNumber(d.manuscripts)}
      `);
    })
    .on("mouseleave", function () {
      d3.select(this).classed("is-active", false);
      hideBTooltip();
    });

  svg.append("g")
    .selectAll("text")
    .data(records)
    .join("text")
    .attr("class", "b-dot-label")
    .attr("x", (d) => x(d.area) + (groupOffset(d.author_group) || 0))
    .attr("y", (d) => y(d.acceptance_rate) - r(d.manuscripts) - 7)
    .attr("text-anchor", "middle")
    .text((d) => d3.format(".1%")(d.acceptance_rate));
}

function showBError(selector, message) {
  d3.select(selector).html(`<div class="error-message"><strong>Data loading failed.</strong><br/>${message}</div>`);
}

async function loadBCharts() {
  try {
    if (!bSankeyCache) bSankeyCache = await d3.json(bPaths.sankey);
    renderBSankey(bSankeyCache);
  } catch (error) {
    showBError("#b-sankey-chart", `Open this page through a local server and confirm that <code>${bPaths.sankey}</code> exists.`);
    console.error(error);
  }

  try {
    if (!bRecommendationCache) {
      bRecommendationCache = await d3.csv(bPaths.recommendation, (d) => ({
        area: d.area,
        author_group: d.author_group,
        recommendation: d.recommendation,
        count: +d.count,
        total: +d.total,
        share: +d.share
      }));
    }
    renderRecommendationChart(bRecommendationCache);
  } catch (error) {
    showBError("#recommendation-chart", `Open this page through a local server and confirm that <code>${bPaths.recommendation}</code> exists.`);
    console.error(error);
  }

  try {
    if (!bDotCache) bDotCache = await d3.json(bPaths.dot);
    renderBDotPlot(bDotCache);
  } catch (error) {
    showBError("#b-dot-chart", `Open this page through a local server and confirm that <code>${bPaths.dot}</code> exists.`);
    console.error(error);
  }
}

function renderCLegend(selector) {
  const legend = d3.select(selector);
  if (legend.empty()) return;

  legend.selectAll("*").remove();
  legend
    .selectAll("span")
    .data(Array.from(cAuthorColors, ([label, color]) => ({ label, color })))
    .join("span")
    .attr("class", "dot-legend-item")
    .html((d) => `<i style="background:${d.color}"></i>${d.label}`);
}

function showCTooltip(event, html) {
  d3.select("#c-tooltip")
    .html(html)
    .style("left", `${event.pageX}px`)
    .style("top", `${event.pageY}px`)
    .style("opacity", 1);
}

function hideCTooltip() {
  d3.select("#c-tooltip").style("opacity", 0);
}

function cPercent(value) {
  return d3.format(".1%")(value);
}

function cScore(value) {
  return d3.format(".2f")(value);
}

function addCAxes(panel, x, y, width, height, xLabel, yLabel, yFormat = d3.format(".0%")) {
  panel.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
    .call((g) => g.select(".domain").remove());

  panel.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2g")));

  panel.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickFormat(yFormat));

  panel.append("text")
    .attr("class", "axis-title")
    .attr("x", width / 2)
    .attr("y", height + 42)
    .attr("text-anchor", "middle")
    .text(xLabel);

  panel.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -46)
    .attr("text-anchor", "middle")
    .text(yLabel);
}

function renderCMainChart(data) {
  const container = d3.select("#c-main-chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const width = Math.max(container.node().clientWidth, 1080);
  const height = 620;
  const margin = { top: 44, right: 30, bottom: 60, left: 66 };
  const gapX = 70;
  const gapY = 76;
  const panelWidth = (width - margin.left - margin.right - gapX) / 2;
  const panelHeight = (height - margin.top - margin.bottom - gapY) / 2;

  const svg = container.append("svg").attr("width", "100%").attr("height", height).attr("viewBox", [0, 0, width, height]);

  cDisciplines.forEach((discipline, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const panel = svg.append("g").attr("transform", `translate(${margin.left + col * (panelWidth + gapX)},${margin.top + row * (panelHeight + gapY)})`);
    const x = d3.scaleLinear().domain([0, 1]).range([0, panelWidth]);
    const y = d3.scaleLinear().domain([0, 1]).range([panelHeight, 0]);
    const line = d3.line().x((d) => x(d.review_score)).y((d) => y(d.probability_final_acceptance)).curve(d3.curveMonotoneX);

    panel.append("text").attr("class", "panel-title").attr("x", 0).attr("y", -18).text(cDisciplineLabels.get(discipline));
    addCAxes(panel, x, y, panelWidth, panelHeight, "Review score", "Predicted acceptance");

    const byAuthor = d3.group(data.filter((d) => d.discipline === discipline), (d) => d.author_group);
    for (const [authorGroup, values] of byAuthor) {
      const sorted = values.slice().sort((a, b) => d3.ascending(a.review_score, b.review_score));
      const color = cAuthorColors.get(authorGroup) || colors.moss;

      panel.append("path").datum(sorted).attr("class", "c-series-line").attr("stroke", color).attr("d", line);
      panel.selectAll(`circle.${authorGroup.replace(/\s+/g, "-")}`)
        .data(sorted)
        .join("circle")
        .attr("class", "c-focus-dot")
        .attr("cx", (d) => x(d.review_score))
        .attr("cy", (d) => y(d.probability_final_acceptance))
        .attr("r", 3.5)
        .attr("fill", color)
        .on("mousemove", (event, d) => {
          showCTooltip(event, `
            <strong>${discipline}</strong>
            <span>Author group: ${d.author_group}</span><br/>
            Review score: ${cScore(d.review_score)}<br/>
            Predicted acceptance: ${cPercent(d.probability_final_acceptance)}
          `);
        })
        .on("mouseleave", hideCTooltip);
    }
  });
}

function renderCValidationChart(data) {
  const container = d3.select("#c-validation-chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const deduped = Array.from(d3.rollup(data, (rows) => rows[0], (d) => `${d.discipline}|${d.score_group}`).values());
  renderCSmallMultiple(container, deduped, {
    yKey: "mean_predicted_acceptance",
    lineClass: "c-validation-line",
    dotColor: colors.teal,
    yLabel: "Mean predicted acceptance",
    tooltip: (d) => `
      <strong>${d.discipline}</strong>
      <span>Score group: ${cScore(d.score_group)}</span><br/>
      Mean predicted acceptance: ${cPercent(d.mean_predicted_acceptance)}<br/>
      Grouped records: ${formatBNumber(d.n)}
    `
  });
}

function buildCDifferenceRows(data) {
  const nested = d3.rollup(
    data,
    (rows) => Object.fromEntries(rows.map((d) => [d.author_group, d.probability_final_acceptance])),
    (d) => d.discipline,
    (d) => d.review_score
  );

  const rows = [];
  for (const [discipline, byScore] of nested) {
    for (const [reviewScore, values] of byScore) {
      if (values["all women"] !== undefined && values["all men"] !== undefined) {
        rows.push({
          discipline,
          review_score: +reviewScore,
          difference: values["all women"] - values["all men"]
        });
      }
    }
  }
  return rows;
}

function renderCDifferenceChart(data) {
  const container = d3.select("#c-difference-chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const diffData = buildCDifferenceRows(data);
  const extent = d3.extent(diffData, (d) => d.difference);
  const absMax = Math.max(Math.abs(extent[0]), Math.abs(extent[1]), 0.06);

  renderCSmallMultiple(container, diffData, {
    yKey: "difference",
    lineClass: "c-difference-line",
    dotColor: "#b78cff",
    yLabel: "Women - men",
    yDomain: [-absMax, absMax],
    yFormat: d3.format("+.0%"),
    zero: true,
    tooltip: (d) => `
      <strong>${d.discipline}</strong>
      <span>Review score: ${cScore(d.review_score)}</span><br/>
      Women - men: ${d3.format("+.1%")(d.difference)}
    `
  });
}

function renderCSmallMultiple(container, data, options) {
  const width = Math.max(container.node().clientWidth, 760);
  const height = 520;
  const margin = { top: 42, right: 30, bottom: 58, left: 62 };
  const gapX = 60;
  const gapY = 72;
  const panelWidth = (width - margin.left - margin.right - gapX) / 2;
  const panelHeight = (height - margin.top - margin.bottom - gapY) / 2;
  const svg = container.append("svg").attr("width", "100%").attr("height", height).attr("viewBox", [0, 0, width, height]);

  cDisciplines.forEach((discipline, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const panel = svg.append("g").attr("transform", `translate(${margin.left + col * (panelWidth + gapX)},${margin.top + row * (panelHeight + gapY)})`);
    const xKey = data[0]?.score_group !== undefined ? "score_group" : "review_score";
    const x = d3.scaleLinear().domain([0, 1]).range([0, panelWidth]);
    const y = d3.scaleLinear().domain(options.yDomain || [0, 1]).range([panelHeight, 0]);
    const line = d3.line().x((d) => x(d[xKey])).y((d) => y(d[options.yKey])).curve(d3.curveMonotoneX);
    const panelData = data.filter((d) => d.discipline === discipline).sort((a, b) => d3.ascending(a[xKey], b[xKey]));

    panel.append("text").attr("class", "panel-title").attr("x", 0).attr("y", -18).text(cDisciplineLabels.get(discipline));
    addCAxes(panel, x, y, panelWidth, panelHeight, xKey === "score_group" ? "Review score group" : "Review score", options.yLabel, options.yFormat);

    if (options.zero) {
      panel.append("line").attr("class", "zero-line").attr("x1", 0).attr("x2", panelWidth).attr("y1", y(0)).attr("y2", y(0));
    }

    panel.append("path").datum(panelData).attr("class", options.lineClass).attr("d", line);
    panel.selectAll("circle")
      .data(panelData)
      .join("circle")
      .attr("class", "c-focus-dot")
      .attr("cx", (d) => x(d[xKey]))
      .attr("cy", (d) => y(d[options.yKey]))
      .attr("r", (d) => d.n ? Math.min(8, 3 + Math.sqrt(d.n) / 42) : 3.5)
      .attr("fill", options.dotColor)
      .on("mousemove", (event, d) => showCTooltip(event, options.tooltip(d)))
      .on("mouseleave", hideCTooltip);
  });
}

function boxStats(values) {
  const sorted = values.slice().sort(d3.ascending);
  return {
    min: d3.min(sorted),
    q1: d3.quantileSorted(sorted, 0.25),
    median: d3.quantileSorted(sorted, 0.5),
    q3: d3.quantileSorted(sorted, 0.75),
    max: d3.max(sorted),
    mean: d3.mean(sorted)
  };
}

function renderCBoxChart(data) {
  const container = d3.select("#c-box-chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const width = Math.max(container.node().clientWidth, 980);
  const height = 560;
  const margin = { top: 38, right: 38, bottom: 96, left: 72 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const groupWidth = innerWidth / cDisciplines.length;
  const boxWidth = 30;

  const svg = container.append("svg").attr("width", "100%").attr("height", height).attr("viewBox", [0, 0, width, height]);
  const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

  chart.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""));
  chart.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));
  chart.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(d3.scalePoint().domain(cDisciplines.map((d) => cDisciplineLabels.get(d))).range([groupWidth / 2, innerWidth - groupWidth / 2])))
    .selectAll("text")
    .attr("dy", "1.1em");

  chart.append("text").attr("class", "axis-title").attr("transform", "rotate(-90)").attr("x", -innerHeight / 2).attr("y", -50).attr("text-anchor", "middle").text("Predicted final acceptance");

  const stats = [];
  d3.rollups(
    data,
    (rows) => boxStats(rows.map((d) => d.probability_final_acceptance)),
    (d) => d.discipline,
    (d) => d.author_group
  ).forEach(([discipline, byAuthor]) => {
    byAuthor.forEach(([authorGroup, value]) => stats.push({ discipline, authorGroup, ...value }));
  });

  stats.forEach((d) => {
    const disciplineIndex = cDisciplines.indexOf(d.discipline);
    const center = groupWidth * disciplineIndex + groupWidth / 2;
    const offset = d.authorGroup === "all men" ? -22 : 22;
    const x = center + offset;
    const color = cAuthorColors.get(d.authorGroup) || colors.moss;

    chart.append("line").attr("class", "c-box-whisker").attr("x1", x).attr("x2", x).attr("y1", y(d.min)).attr("y2", y(d.max)).attr("stroke", color);
    chart.append("line").attr("class", "c-box-cap").attr("x1", x - boxWidth / 3).attr("x2", x + boxWidth / 3).attr("y1", y(d.min)).attr("y2", y(d.min)).attr("stroke", color);
    chart.append("line").attr("class", "c-box-cap").attr("x1", x - boxWidth / 3).attr("x2", x + boxWidth / 3).attr("y1", y(d.max)).attr("y2", y(d.max)).attr("stroke", color);
    chart.append("rect").attr("class", "c-box-rect").attr("x", x - boxWidth / 2).attr("width", boxWidth).attr("y", y(d.q3)).attr("height", y(d.q1) - y(d.q3)).attr("fill", color).attr("stroke", color);
    chart.append("line").attr("class", "c-box-median").attr("x1", x - boxWidth / 2).attr("x2", x + boxWidth / 2).attr("y1", y(d.median)).attr("y2", y(d.median)).attr("stroke", color);
    chart.append("circle").attr("class", "mean-dot").attr("cx", x).attr("cy", y(d.mean)).attr("r", 3.7).attr("fill", color);
    chart.append("rect")
      .attr("class", "box-hit")
      .attr("x", x - 26)
      .attr("y", y(d.max) - 16)
      .attr("width", 52)
      .attr("height", y(d.min) - y(d.max) + 32)
      .on("mousemove", (event) => {
        showCTooltip(event, `
          <strong>${d.discipline}</strong>
          <span>Author group: ${d.authorGroup}</span><br/>
          Min: ${cPercent(d.min)}<br/>
          Q1: ${cPercent(d.q1)}<br/>
          Mean: ${cPercent(d.mean)}<br/>
          Median: ${cPercent(d.median)}<br/>
          Q3: ${cPercent(d.q3)}<br/>
          Max: ${cPercent(d.max)}
        `);
      })
      .on("mouseleave", hideCTooltip);
  });
}

function renderCCharts() {
  renderCLegend("#c-main-legend");
  renderCLegend("#c-box-legend");
  renderCMainChart(cPredictionCache);
  renderCValidationChart(cValidationCache);
  renderCDifferenceChart(cPredictionCache);
  renderCBoxChart(cPredictionCache);
}

async function loadCCharts() {
  try {
    const [prediction, validation] = await Promise.all([
      d3.csv(cPaths.prediction, (d) => ({
        review_score: +d.review_score,
        author_group: d.author_group,
        discipline: d.discipline,
        probability_final_acceptance: +d.probability_final_acceptance
      })),
      d3.csv(cPaths.validation, (d) => ({
        score_group: +d.score_group,
        author_group: d.author_group,
        discipline: d.discipline,
        mean_predicted_acceptance: +d.mean_predicted_acceptance,
        n: +d.n
      }))
    ]);
    cPredictionCache = prediction;
    cValidationCache = validation;
    renderCCharts();
  } catch (error) {
    showBError("#c-main-chart", `Open this page through a local server and confirm that <code>${cPaths.prediction}</code> and <code>${cPaths.validation}</code> exist.`);
    console.error(error);
  }
}

window.addEventListener("resize", () => {
  clearTimeout(window.__chartResizeTimer);
  window.__chartResizeTimer = setTimeout(() => {
    renderDumbbellChart();
    if (rDeskRejectionCache) renderDeskRejectionChart(rDeskRejectionCache);
    if (bSankeyCache) renderBSankey(bSankeyCache);
    if (bRecommendationCache) renderRecommendationChart(bRecommendationCache);
    if (bDotCache) renderBDotPlot(bDotCache);
    if (cPredictionCache && cValidationCache) renderCCharts();
  }, 180);
});

renderKpis();
setupKpiObserver();
setupMethodAccordions();
renderDumbbellChart();
loadDeskRejectionChart();
loadBCharts();
loadCCharts();

const heroSlides = Array.from(document.querySelectorAll(".visual-slides .slide"));
let heroSlideIndex = 0;

if (heroSlides.length > 1) {
  setInterval(() => {
    heroSlides[heroSlideIndex].classList.remove("active");
    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    heroSlides[heroSlideIndex].classList.add("active");
  }, 6000);
}
