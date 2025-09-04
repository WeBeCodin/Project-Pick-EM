/**
 * Basic health check test
 */

describe('Health Check', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to Node.js globals', () => {
    expect(process).toBeDefined();
    expect(process.env).toBeDefined();
  });
});
