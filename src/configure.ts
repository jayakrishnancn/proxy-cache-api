import fs from "fs";

const CONFIG_FILE = "./config.json";

const defaultConfig = {
  remote: {
    baseUrl: "https://jsonplaceholder.typicode.com",
  },
  secure: true,
  port: 9000,
  skipList: [],
  mockDir: "mocks",
  methods: ["POST", "GET", "PUT", "DELETE"],
  contentType: ["application/json", "application/x-www-form-urlencoded"],
  blackList: [],
};

const getConfig = () => {
  let localConfig = defaultConfig;

  if (fs.existsSync(CONFIG_FILE)) {
    localConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } else {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  }

  // create mock directory if does not exist.
  if (!fs.existsSync(localConfig.mockDir)) {
    fs.mkdirSync(localConfig.mockDir);
  }
  const sub_directory =
    localConfig.mockDir + "/" + localConfig.remote.baseUrl.replace(/\W+/g, "_");
  // create mock directory if does not exist.
  if (!fs.existsSync(sub_directory)) {
    fs.mkdirSync(sub_directory);
  }

  return { ...defaultConfig, ...localConfig, path: sub_directory };
};

const config = getConfig();

export { config };
