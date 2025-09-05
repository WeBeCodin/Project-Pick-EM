describe('RSS Parser Service', () => {
  test('should be able to import the service', () => {
    const { rssParserService } = require('../rss-parser.service');
    expect(rssParserService).toBeDefined();
    expect(typeof rssParserService).toBe('object');
  });

  test('should have all required methods', () => {
    const { rssParserService } = require('../rss-parser.service');
    
    expect(typeof rssParserService.fetchScheduleForWeek).toBe('function');
    expect(typeof rssParserService.fetchLiveScores).toBe('function');
    expect(typeof rssParserService.syncGamesToDatabase).toBe('function');
    expect(typeof rssParserService.updateGameScores).toBe('function');
  });

  test('should handle invalid week numbers gracefully', async () => {
    const { rssParserService } = require('../rss-parser.service');
    
    const result = await rssParserService.fetchScheduleForWeek(0);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('should return arrays for valid operations', async () => {
    const { rssParserService } = require('../rss-parser.service');
    
    const schedule = await rssParserService.fetchScheduleForWeek(1);
    expect(Array.isArray(schedule)).toBe(true);
    
    const scores = await rssParserService.fetchLiveScores(1);
    expect(Array.isArray(scores)).toBe(true);
  });

  test('should handle sync operations', async () => {
    const { rssParserService } = require('../rss-parser.service');
    
    const syncResult = await rssParserService.syncGamesToDatabase(1);
    expect(typeof syncResult).toBe('object');
    expect(typeof syncResult.synced).toBe('number');
    expect(typeof syncResult.errors).toBe('number');
    
    const updateResult = await rssParserService.updateGameScores(1);
    expect(typeof updateResult).toBe('object');
    expect(typeof updateResult.updated).toBe('number');
    expect(typeof updateResult.errors).toBe('number');
  });
});
