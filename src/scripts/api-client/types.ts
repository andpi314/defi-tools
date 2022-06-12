export interface IAuthProvider {
  getApiKey(): string;

  getPartnerToken(): string;
}
