import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Augusto Gobatto',
  description: 'Como coletamos, usamos e protegemos seus dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <main style={{
      background: '#0A0A0A',
      color: '#F2F2F2',
      minHeight: '100dvh',
      fontFamily: "'Inter', sans-serif",
      lineHeight: 1.7,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500&display=swap');
        .priv-wrap { max-width: 720px; margin: 0 auto; padding: 64px 24px 96px; }
        .priv-wrap h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 4vw, 40px); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; }
        .priv-wrap .updated { font-size: 13px; color: #666; margin-bottom: 40px; }
        .priv-wrap p { font-size: 15px; color: #C0C0C0; margin-bottom: 16px; }
        .priv-wrap h2 { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; color: #F2F2F2; margin: 40px 0 12px; }
        .priv-wrap ul { padding-left: 20px; margin-bottom: 16px; }
        .priv-wrap li { font-size: 15px; color: #C0C0C0; margin-bottom: 8px; }
        .priv-wrap a { color: #00FF88; text-decoration: none; }
        .priv-wrap a:hover { text-decoration: underline; }
        .priv-wrap .sep { height: 1px; background: rgba(255,255,255,0.07); margin: 48px 0; }
        .priv-wrap .back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #666; margin-bottom: 40px; }
        .priv-wrap .back:hover { color: #F2F2F2; }
        .priv-wrap strong { color: #F2F2F2; font-weight: 500; }
      `}</style>

      <div className="priv-wrap">
        <Link href="/" className="back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </Link>

        <h1>Política de Privacidade</h1>
        <p className="updated">Última atualização: 8 de maio de 2026</p>

        <p>
          Esta Política de Privacidade descreve como <strong>Augusto Gobatto</strong> (Amago LTDA / CNPJ 39.325.398/0001-71)
          coleta, usa, compartilha e protege os dados pessoais dos visitantes e clientes do site augustogobatto.com e seus
          subdomínios (incluindo ia.augustogobatto.com), bem como dos usuários que interagem com nossos anúncios e ferramentas internas.
        </p>
        <p>
          Ao acessar o site, fornecer dados em um formulário ou interagir com nossos anúncios, você concorda com os termos abaixo.
        </p>

        <h2>1. Quem somos (Controlador dos dados)</h2>
        <ul>
          <li><strong>Responsável:</strong> Augusto Gobatto</li>
          <li><strong>Empresa:</strong> Amago LTDA — CNPJ 39.325.398/0001-71</li>
          <li><strong>E-mail de contato:</strong> <a href="mailto:gobattto@gmail.com">gobattto@gmail.com</a></li>
          <li><strong>Encarregado de Dados (DPO):</strong> Augusto Gobatto — <a href="mailto:gobattto@gmail.com">gobattto@gmail.com</a></li>
        </ul>

        <h2>2. Quais dados coletamos</h2>
        <p>Coletamos somente o necessário para entregar nossos produtos, serviços e comunicações:</p>
        <ul>
          <li><strong>Dados fornecidos por você:</strong> nome, e-mail, telefone/WhatsApp e demais informações inseridas em formulários, checkouts ou conversas conosco.</li>
          <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, sistema operacional, páginas visitadas, tempo de permanência, origem do tráfego (UTM), cookies e identificadores de dispositivo.</li>
          <li><strong>Dados de interação com anúncios:</strong> eventos coletados via Meta Pixel, Conversions API e ferramentas equivalentes (cliques, visualizações, conversões, leads).</li>
          <li><strong>Dados de pagamento:</strong> quando aplicável, processados diretamente pelos provedores de pagamento (não armazenamos número de cartão).</li>
        </ul>

        <h2>3. Para que usamos seus dados</h2>
        <ul>
          <li>Entregar produtos, serviços, conteúdo e suporte solicitados.</li>
          <li>Enviar comunicações sobre nossos produtos, ofertas e novidades (com possibilidade de descadastro a qualquer momento).</li>
          <li>Mensurar a eficácia de campanhas publicitárias e otimizar nossos anúncios em plataformas como Meta (Facebook/Instagram), Google e similares.</li>
          <li>Cumprir obrigações legais, fiscais e regulatórias.</li>
          <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
        </ul>
        <p>
          <strong>Bases legais (LGPD, Lei nº 13.709/18):</strong> execução de contrato, consentimento, legítimo interesse e cumprimento de obrigação legal.
        </p>

        <h2>4. Compartilhamento de dados</h2>
        <p>Podemos compartilhar dados com:</p>
        <ul>
          <li><strong>Plataformas de publicidade e analytics:</strong> Meta Platforms (Facebook/Instagram), Google, TikTok e similares — para mensuração e otimização de campanhas, nos termos das políticas dessas plataformas.</li>
          <li><strong>Provedores de infraestrutura:</strong> hospedagem, e-mail marketing, CRM, processamento de pagamentos, atendimento via WhatsApp e ferramentas de automação.</li>
          <li><strong>Modelos de IA e processadores externos:</strong> quando usados para gerar conteúdo, qualificar leads ou apoiar atendimento (ex.: OpenAI), sob obrigações contratuais de sigilo.</li>
          <li><strong>Autoridades públicas:</strong> quando exigido por lei, ordem judicial ou requisição regulatória.</li>
        </ul>
        <p>Não vendemos seus dados a terceiros.</p>

        <h2>5. Cookies e tecnologias similares</h2>
        <p>
          Utilizamos cookies próprios e de terceiros para lembrar suas preferências, mensurar tráfego, personalizar conteúdo e
          veicular anúncios. Você pode desativar cookies a qualquer momento nas configurações do seu navegador — alguns recursos
          podem deixar de funcionar.
        </p>

        <h2>6. Pixels e plataformas de mídia (Meta, Google e similares)</h2>
        <p>
          Usamos o Meta Pixel e ferramentas de mensuração para acompanhar conversões e exibir anúncios mais relevantes. Esses dados
          são tratados pela Meta conforme a{' '}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
            Política de Privacidade da Meta
          </a>
          . Para encerrar o uso de seus dados em anúncios da Meta, acesse as{' '}
          <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer">
            configurações de anúncios
          </a>
          {' '}na sua conta.
        </p>

        <h2>7. Retenção dos dados</h2>
        <p>
          Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas e atender obrigações legais
          (em geral, até 5 anos após o último contato, salvo exigência legal específica).
        </p>

        <h2>8. Seus direitos (LGPD)</h2>
        <p>Você pode, a qualquer momento:</p>
        <ul>
          <li>Confirmar a existência de tratamento dos seus dados.</li>
          <li>Acessar, corrigir, atualizar seus dados.</li>
          <li>Solicitar a anonimização, bloqueio ou exclusão de dados desnecessários ou tratados em desconformidade.</li>
          <li>Revogar consentimento.</li>
          <li>Reclamar perante a Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p>
          Para exercer qualquer direito, envie um e-mail para{' '}
          <a href="mailto:gobattto@gmail.com">gobattto@gmail.com</a>{' '}
          com o assunto <strong>"LGPD — [seu pedido]"</strong>. Respondemos em até 15 dias.
        </p>

        <h2>9. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra acesso não autorizado, perda ou
          alteração indevida. Apesar disso, nenhum sistema é 100% inviolável — em caso de incidente relevante, comunicaremos os
          titulares afetados e a ANPD nos termos da lei.
        </p>

        <h2>10. Transferência internacional</h2>
        <p>
          Alguns provedores que utilizamos (ex.: Meta, Google, OpenAI) podem armazenar dados em servidores localizados fora do
          Brasil. Nesses casos, exigimos garantias contratuais e/ou adesão a frameworks reconhecidos pela LGPD.
        </p>

        <h2>11. Crianças e adolescentes</h2>
        <p>
          Nossos produtos não são direcionados a menores de 18 anos. Não coletamos conscientemente dados de menores. Se
          identificarmos coleta dessa natureza, excluiremos os registros.
        </p>

        <h2>12. Alterações nesta política</h2>
        <p>
          Podemos atualizar esta Política a qualquer momento. A versão vigente fica disponível nesta página, com a data da última
          atualização no topo. Mudanças relevantes serão comunicadas pelos canais cadastrados.
        </p>

        <h2>13. Contato</h2>
        <p>
          Dúvidas, solicitações ou reclamações:<br />
          <a href="mailto:gobattto@gmail.com">gobattto@gmail.com</a>
        </p>

        <div className="sep" />
        <p style={{ fontSize: 13, color: '#444' }}>
          Amago LTDA — CNPJ 39.325.398/0001-71
        </p>
      </div>
    </main>
  )
}
