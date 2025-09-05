import { AuthService } from '../auth.service';

describe('AuthService Basic Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('should create AuthService instance', () => {
    expect(authService).toBeDefined();
    expect(authService).toBeInstanceOf(AuthService);
  });
});
