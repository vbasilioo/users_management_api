import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenBlacklistService {
  private readonly blacklistedTokens: Set<string> = new Set();
  
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Adiciona um token à blacklist
   */
  async addToBlacklist(token: string): Promise<void> {
    if (!token) return;
    
    try {
      const decoded = this.jwtService.verify(token);
      
      this.blacklistedTokens.add(token);
      
    } catch (error) {
      console.log('Token inválido ou expirado, não foi adicionado à blacklist');
    }
  }

  /**
   * Verifica se um token está na blacklist
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
} 