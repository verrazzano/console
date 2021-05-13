// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export class VzError extends Error {
  public static HTTPNotFoundCode = 404;
  private code: string | number;
  public constructor(
    error: string | Error | VzError,
    code?: string | number,
    name?: string,
    stack?: string
  ) {
    super((error as any).message || error);
    this.name = name || this.name;
    this.stack = stack || this.stack;
    this.code = code;
  }

  public getCode(): string | number {
    return this.code;
  }
}
