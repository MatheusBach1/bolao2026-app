export const teamFlags: Record<string, string> = {
  // América do Norte e Central
  'Canadá': '🇨🇦',
  'Estados Unidos': '🇺🇸',
  'México': '🇲🇽',
  'Curaçao': '🇨🇼',
  'Haiti': '🇭🇹',
  'Panamá': '🇵🇦',

  // América do Sul
  'Argentina': '🇦🇷',
  'Brasil': '🇧🇷',
  'Colômbia': '🇨🇴',
  'Equador': '🇪🇨',
  'Paraguai': '🇵🇾',
  'Uruguai': '🇺🇾',

  // Europa
  'Alemanha': '🇩🇪',
  'Áustria': '🇦🇹',
  'Bélgica': '🇧🇪',
  'Bósnia e Herzegovina': '🇧🇦',
  'Croácia': '🇭🇷',
  'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Espanha': '🇪🇸',
  'França': '🇫🇷',
  'Holanda (Países Baixos)': '🇳🇱',
  'Holanda': '🇳🇱',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Noruega': '🇳🇴',
  'Portugal': '🇵🇹',
  'República Tcheca': '🇨🇿',
  'Suécia': '🇸🇪',
  'Suíça': '🇨🇭',
  'Suiça': '🇨🇭',
  'Turquia': '🇹🇷',

  // África
  'África do Sul': '🇿🇦',
  'Argélia': '🇩🇿',
  'Cabo Verde': '🇨🇻',
  'Costa do Marfim': '🇨🇮',
  'Egito': '🇪🇬',
  'Gana': '🇬🇭',
  'Marrocos': '🇲🇦',
  'República Democrática do Congo': '🇨🇩',
  'RD Congo': '🇨🇩',
  'Senegal': '🇸🇳',
  'Tunísia': '🇹🇳',

  // Ásia e Oceania
  'Arábia Saudita': '🇸🇦',
  'Austrália': '🇦🇺',
  'Catar': '🇶🇦',
  'Coreia do Sul': '🇰🇷',
  'Irã': '🇮🇷',
  'Iraque': '🇮🇶',
  'Japão': '🇯🇵',
  'Jordânia': '🇯🇴',
  'Uzbequistão': '🇺🇿',
  'Nova Zelândia': '🇳🇿',
}

export function getFlag(teamName: string): string {
  return teamFlags[teamName.trim()] ?? '🏳️'
}
