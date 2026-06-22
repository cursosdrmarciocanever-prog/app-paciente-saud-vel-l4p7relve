import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default function Privacidade() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Privacidade e Termos de Uso
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Clínica Canever — última atualização: junho de 2026.
        </p>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-lg font-semibold">1. Quem somos</h2>
            <p className="text-muted-foreground">
              A Clínica Canever oferece este aplicativo para acompanhamento de saúde dos seus
              pacientes (agendamentos, exames, bioimpedância, fotos de evolução, planos
              nutricionais, loja de injetáveis e suporte). O tratamento de dados segue a Lei Geral
              de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Dados que coletamos</h2>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Dados cadastrais: nome, e-mail, CPF e telefone.</li>
              <li>
                Dados de saúde: exames, laudos de bioimpedância, fotos de evolução, registros de
                atividade física, alimentação e hidratação, e planos nutricionais.
              </li>
              <li>Dados de uso do aplicativo, para melhorar a experiência.</li>
              <li>
                Dados do Apple Watch / app Saúde (quando você autoriza), como treinos, passos e
                calorias.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Como usamos seus dados</h2>
            <p className="text-muted-foreground">
              Utilizamos seus dados exclusivamente para prestar o atendimento de saúde, gerenciar
              agendamentos e pedidos, acompanhar sua evolução clínica e melhorar o aplicativo. Dados
              de saúde são considerados sensíveis e tratados com cuidado reforçado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Compartilhamento</h2>
            <p className="text-muted-foreground">
              Não vendemos seus dados. O compartilhamento ocorre apenas com a equipe clínica
              responsável pelo seu atendimento e com prestadores necessários ao funcionamento do
              app (ex.: hospedagem), sempre sob obrigações de confidencialidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Segurança</h2>
            <p className="text-muted-foreground">
              Seus arquivos de saúde (exames, fotos e bioimpedância) são protegidos e acessíveis
              apenas por você e pela equipe da clínica, mediante autenticação. Mantemos backups
              regulares e adotamos medidas técnicas para proteger seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Seus direitos (LGPD)</h2>
            <p className="text-muted-foreground">
              Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, bem
              como revogar consentimentos. Para exercer esses direitos, entre em contato pelo
              WhatsApp (44) 9 9167-1203.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Assistentes de inteligência artificial</h2>
            <p className="text-muted-foreground">
              O app oferece assistentes virtuais (suporte, nutrição, exames e médico). Eles têm
              caráter informativo e <strong>não substituem</strong> a consulta com um profissional
              de saúde. Em caso de emergência, procure atendimento de urgência.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Pagamentos e pedidos</h2>
            <p className="text-muted-foreground">
              Pedidos realizados na loja de injetáveis são confirmados pela equipe da clínica. As
              condições de pagamento e entrega são informadas no momento da confirmação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Contato</h2>
            <p className="text-muted-foreground">
              Dúvidas sobre privacidade ou estes termos? Fale com a Clínica Canever:
              <br />
              Avenida Pedro Taques, 294 — Atrium Centro Empresarial, Torre Sul, sala 1203, Maringá/PR.
              <br />
              WhatsApp: (44) 9 9167-1203.
            </p>
          </section>

          <p className="text-xs text-muted-foreground border-t pt-4">
            Este documento é um modelo-base e pode ser ajustado pela clínica e por sua assessoria
            jurídica.
          </p>
        </div>
      </div>
    </div>
  )
}
