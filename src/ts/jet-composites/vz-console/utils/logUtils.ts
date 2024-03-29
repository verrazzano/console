// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export const logSuccess = (successMessage: string): void => {
  console.info("Success: " + successMessage);
};

export const logInfo = (info: string, data: any): void => {
  const eventOptions = {
    notificationMessage: info,
    metadata: {
      data,
    },
  };
  console.info("Info: " + info, eventOptions);
};

export const logFailure = (failureMessage: string): void => {
  console.error("Failure: " + failureMessage);
};

export const logGlobalJsError = (error: Error, info: any): void => {
  const eventOptions = {
    notificationMessage: error.message,
    metadata: {
      error,
      stacktrace: info.componentStack,
    },
  };

  console.error(
    "JavaScript failure in component: " + error.message,
    eventOptions
  );
};
