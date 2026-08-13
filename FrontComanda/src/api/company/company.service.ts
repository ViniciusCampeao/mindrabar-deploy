import { httpClient } from '../httpClient';
import { COMPANIES } from '../endpoints';
import type { Company } from './company.interface';

export interface CompanyService {
  getCompanyDetails(): Promise<Company>;
}

/**
 * Implementação do serviço de empresa
 */
export class CompanyServiceImpl implements CompanyService {
  /**
   * Busca os dados da empresa logada
   */
  async getCompanyDetails(): Promise<Company> {
    const response = await httpClient.get<Company>(COMPANIES.DETAILS);
    return response.data;
  }
}

// Exporta uma instância para uso em toda a aplicação
export const companyService: CompanyService = new CompanyServiceImpl();
