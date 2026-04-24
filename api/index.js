const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/bfhl', (req, res) => {
  const data = req.body.data;

  // Format: tarang_patra_ddmmyyyy
  const user_id = "tarang_patra_17091999";
  // College email
  const email_id = "tp0876@srmist.edu.in";
  // Roll number provided
  const college_roll_number = "RA2311029010026";

  if (!Array.isArray(data)) {
    return res.status(400).json({
      is_success: false,
      message: "Invalid input, 'data' must be an array"
    });
  }

  let invalid_entries = [];
  let duplicate_set = new Set();
  let validEdges = [];
  let seen = new Set();
  let nodeFirstAppearance = {};

  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    if (typeof item !== 'string') {
      invalid_entries.push(String(item));
      continue;
    }
    let str = item.trim();
    if (/^[A-Z]->[A-Z]$/.test(str)) {
      if (str[0] === str[3]) {
        invalid_entries.push(item);
      } else if (seen.has(str)) {
        duplicate_set.add(str);
      } else {
        seen.add(str);
        validEdges.push(str);
        let u = str[0];
        let v = str[3];
        if (nodeFirstAppearance[u] === undefined) nodeFirstAppearance[u] = i;
        if (nodeFirstAppearance[v] === undefined) nodeFirstAppearance[v] = i;
      }
    } else {
      invalid_entries.push(item);
    }
  }

  let duplicate_edges = Array.from(duplicate_set);

  let parents = {};
  let childrenMap = {};
  let nodes = new Set();

  for (let edge of validEdges) {
    let u = edge[0];
    let v = edge[3];
    nodes.add(u);
    nodes.add(v);

    // First parent wins, subsequent silently discarded
    if (parents[v] === undefined) {
      parents[v] = u;
      if (!childrenMap[u]) childrenMap[u] = [];
      childrenMap[u].push(v);
    }
  }

  function buildTreeObj(node) {
    let obj = {};
    if (childrenMap[node]) {
      for (let child of childrenMap[node]) {
        obj[child] = buildTreeObj(child);
      }
    }
    return obj;
  }

  function getDepth(node) {
    if (!childrenMap[node] || childrenMap[node].length === 0) return 1;
    let maxChildDepth = 0;
    for (let child of childrenMap[node]) {
      maxChildDepth = Math.max(maxChildDepth, getDepth(child));
    }
    return 1 + maxChildDepth;
  }

  let visited = new Set();
  let hierarchies = [];

  let roots = [];
  for (let node of nodes) {
    if (parents[node] === undefined) {
      roots.push(node);
    }
  }

  for (let root of roots) {
    let treeObj = { [root]: buildTreeObj(root) };
    let depth = getDepth(root);

    let q = [root];
    while (q.length > 0) {
      let curr = q.shift();
      visited.add(curr);
      if (childrenMap[curr]) {
        q.push(...childrenMap[curr]);
      }
    }

    hierarchies.push({
      root: root,
      tree: treeObj,
      depth: depth
    });
  }

  // Pure cycles or components where nodes only have parents
  let unvisited = Array.from(nodes).filter(n => !visited.has(n));
  while (unvisited.length > 0) {
    let start = unvisited[0];
    let wcc = new Set();
    let q = [start];
    wcc.add(start);

    while (q.length > 0) {
      let node = q.shift();
      let neighbors = [];
      if (childrenMap[node]) neighbors.push(...childrenMap[node]);
      if (parents[node]) neighbors.push(parents[node]);

      for (let nei of neighbors) {
        if (!wcc.has(nei) && !visited.has(nei)) {
          wcc.add(nei);
          q.push(nei);
        }
      }
    }

    let wccNodes = Array.from(wcc);
    wccNodes.sort();
    let cycleRoot = wccNodes[0]; // Lexicographically smallest

    hierarchies.push({
      root: cycleRoot,
      tree: {},
      has_cycle: true
    });

    for (let n of wccNodes) {
      visited.add(n);
    }
    unvisited = Array.from(nodes).filter(n => !visited.has(n));
  }

  hierarchies.sort((a, b) => {
    return (nodeFirstAppearance[a.root] ?? 999999) - (nodeFirstAppearance[b.root] ?? 999999);
  });

  let total_trees = 0;
  let total_cycles = 0;
  let max_depth = 0;
  let largest_tree_root = null;

  for (let h of hierarchies) {
    if (h.has_cycle) {
      total_cycles++;
    } else {
      total_trees++;
      if (h.depth > max_depth) {
        max_depth = h.depth;
        largest_tree_root = h.root;
      } else if (h.depth === max_depth) {
        if (!largest_tree_root || h.root < largest_tree_root) {
          largest_tree_root = h.root;
        }
      }
    }
  }

  let summary = {
    total_trees,
    total_cycles,
    largest_tree_root
  };

  res.json({
    user_id,
    email_id,
    college_roll_number,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
