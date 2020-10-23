// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
const expect = chai.expect;

export const checkMetaItemLabelValue = (metaItem: string, label: string, value: string) => {
    expect(metaItem).to.not.be.empty;
    let [actualLabel, ...end] = metaItem.split(':');
    let actualValue = end.join(":");
    expect(actualLabel.trim()).to.be.equal(label.trim());
    expect(actualValue.trim()).to.be.equal(value.trim());
  }