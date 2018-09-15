"use strict";

const express = require("express");
const helmet = require("helmet");
const next = require("next");
const rss = require("rss");
const gql = require("graphql-tag");
const apollo = require("./lib/apollo.js");
const { parse } = require("url");
const { join } = require("path");
const pino = require("express-pino-logger")();
const {
  AggregationType,
  Measure,
  MeasureUnit,
  Stats
} = require("@opencensus/core");
const prometheus = require("@opencensus/exporter-prometheus");

const stats = new Stats();
var exporter = new prometheus.PrometheusStatsExporter({
  prefix: "writing"
});
stats.registerExporter(exporter);

const app = next({
  dir: ".",
  dev: process.env.NODE_ENV !== "production"
});

async function recentPosts() {
  try {
    const client = apollo.create();
    let data = await client.query({
      query: gql`
        query recentPosts {
          posts(limit: 20, offset: 0) {
            id
            title
            datetime
          }
        }
      `
    });

    return data.data.posts;
  } catch (err) {
    console.error(err);
    return [];
  }
}

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(pino);
    server.use(helmet());

    server.get("/metrics", (req, res) => {
      res.set(
        "Content-Type",
        prometheus.PrometheusStatsExporter.DEFAULT_OPTIONS.contentType
      );
      res.end(exporter.registry.metrics());
    });

    server.get("/post/:id", (req, res) => {
      const actualPage = "/post";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("/feed.rss", async (req, res) => {
      let feed = new rss({
        title: "Nat? Nat. Nat!"
      });
      let data = await recentPosts();

      data.forEach(p => {
        feed.item({
          title: p.title,
          url: `https://writing.natwelch.com/post/${p.id}`,
          date: p.datetime
        });
      });

      var xml = feed.xml();
      res.set("Content-Type", "text/xml");
      res.send(xml);
    });

    server.all("*", (req, res) => {
      const handle = app.getRequestHandler();
      const parsedUrl = parse(req.url, true);
      const rootStaticFiles = [
        "/robots.txt",
        "/sitemap.xml",
        "/favicon.ico",
        "/.well-known/brave-payments-verification.txt"
      ];

      const redirects = {};

      if (parsedUrl.pathname in redirects) {
        return res.redirect(redirects[parsedUrl.pathname]);
      }

      if (rootStaticFiles.indexOf(parsedUrl.pathname) > -1) {
        const path = join(__dirname, "static", parsedUrl.pathname);
        app.serveStatic(req, res, path);
      } else {
        handle(req, res, parsedUrl);
      }
      return;
    });

    server.listen(8080, "0.0.0.0", err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:8080");
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
