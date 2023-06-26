const fs = require("fs");
const yaml = require("js-yaml");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Please provide a YAML file path as a command-line argument.");
  process.exit(1);
}

const currentPath = process.cwd();

function sortObjectKeys(obj) {
  const sortedObj = {};
  const sortedKeys = Object.keys(obj).sort((a, b) => obj[a] - obj[b]);

  for (const key of sortedKeys) {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      sortedObj[key] = sortObjectKeys(obj[key]);
    } else {
      sortedObj[key] = obj[key];
    }
  }

  return sortedObj;
}

function sortComponentKeys(component) {
  if (component.variables && typeof component.variables === "object") {
    component.variables = sortObjectKeys(component.variables);
  }

  if (component.secrets && typeof component.secrets === "object") {
    component.secrets = sortObjectKeys(component.secrets);
  }

  return component;
}

function sortYamlKeys(filePath) {
  const fileContents = fs.readFileSync(`${currentPath}/${filePath}`, "utf8");
  const data = yaml.load(fileContents);

  if (data.sites && Array.isArray(data.sites)) {
    data.sites = data.sites.map((site) => {
      if (site.components && Array.isArray(site.components)) {
        site.components = site.components.map(sortComponentKeys);
      }
      return site;
    });
  }

  const sortedYaml = yaml.dump(data, { lineWidth: -1 });

  fs.writeFileSync(filePath, sortedYaml, "utf8");
  console.info(`YAML keys sorted in file: ${filePath}`);
}

sortYamlKeys(filePath);
