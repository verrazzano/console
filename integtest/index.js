// Copyright (C) 2020, 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

const {utils} = require("./utils/Utils");

if (utils.isComponentEnabledInTestConfig("osd")) {
    require("./specs/OSDMainPage.spec");
}

if (utils.isComponentEnabledInTestConfig("grafana")) {
    require("./specs/GrafanaMainPage.spec");
}

if (utils.isComponentEnabledInTestConfig("prometheus")) {
    require("./specs/PrometheusMainPage.spec");
}

if (utils.isComponentEnabledInTestConfig("thanosquery")) {
    require("./specs/ThanosQueryMainPage.spec");
}

if (utils.isComponentEnabledInTestConfig("kiali")) {
    require("./specs/KialiMainPage.spec");
}

if (utils.isComponentEnabledInTestConfig("jaeger")) {
    require("./specs/JaegerMainPage.spec");
}

require("./specs/MainPage.spec");
require("./specs/MainPageNegative.spec");
