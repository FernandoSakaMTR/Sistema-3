import React, { useState } from 'react';
import { ChevronDownIcon } from '../components/icons';
import type { User } from '../types';
import { UserRole } from '../types';

interface TutorialPageProps {
    user: User;
}

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-6 text-lg font-semibold text-gray-800 hover:bg-gray-100 focus:outline-none"
            >
                <span>{title}</span>
                <ChevronDownIcon className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-6 bg-gray-50 text-gray-700 space-y-3 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};


const TutorialPage: React.FC<TutorialPageProps> = ({ user }) => {
    const isMaintenanceOrHigher = [UserRole.MAINTENANCE, UserRole.MANAGER, UserRole.ADMIN].includes(user.role);
    const isManagerOrAdmin = [UserRole.MANAGER, UserRole.ADMIN].includes(user.role);
    const isAdmin = user.role === UserRole.ADMIN;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tutorial e Guia de Uso</h1>
            <p className="text-lg text-gray-600 mb-8">
                Bem-vindo! Aqui você encontrará guias sobre como utilizar as funcionalidades disponíveis para o seu perfil.
            </p>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <AccordionItem title="Funcionalidade Essencial: Modo Offline e Sincronização" defaultOpen={true}>
                    <h3 className="text-xl font-bold text-brand-blue mb-2">Como Funciona?</h3>
                    <p>
                        Este sistema foi projetado para ser 100% funcional mesmo sem conexão com a internet. Você nunca perderá seu trabalho por causa de uma rede Wi-Fi instável.
                    </p>
                    <ul className="list-disc list-inside space-y-2 mt-4">
                        <li><strong>Trabalho Offline:</strong> Você pode abrir a aplicação, criar, editar e gerenciar OS normalmente, mesmo que o ícone <strong>"Offline"</strong> apareça no cabeçalho.</li>
                        <li><strong>Salvamento Local:</strong> Todas as suas ações são salvas instantaneamente e de forma segura no seu dispositivo (celular, tablet ou computador).</li>
                        <li><strong>Fila de Sincronização:</strong> Suas ações entram em uma "fila de espera" local. Você pode ver quantas ações estão pendentes no indicador ao lado do status "Offline".</li>
                        <li><strong>Sincronização Automática:</strong> Assim que seu dispositivo se reconectar à internet, o sistema enviará automaticamente todas as ações pendentes para o servidor. O indicador mudará para <strong>"Sincronizando..."</strong> e, finalmente, para <strong>"Sincronizado"</strong>.</li>
                    </ul>
                    <p className="mt-4 font-semibold">
                        Resumindo: Pode usar a aplicação sem se preocupar. Seus dados estão sempre seguros e serão sincronizados assim que possível.
                    </p>
                </AccordionItem>

                <AccordionItem title="Guia para Solicitantes">
                    <h3 className="text-xl font-bold text-brand-blue mb-2">Como Abrir uma Nova Ordem de Serviço (OS)</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li>No menu lateral, clique em <strong>"Abrir Nova OS"</strong>.</li>
                        <li>Preencha todos os campos do formulário com o máximo de detalhes possível.</li>
                        <li><strong>Status do Equipamento:</strong> Informe se a máquina está <strong className="text-machine-down">INOPERANTE</strong>, <strong className="text-machine-partial">Parcialmente funcionando</strong> ou <strong className="text-machine-ok">Funcionando</strong>. Isso é crucial para a priorização.</li>
                        <li><strong>Data e Hora da Falha:</strong> Preencher corretamente é essencial para que os gestores possam calcular métricas importantes como o MTBF (Tempo Médio Entre Falhas).</li>
                        <li>Anexe fotos ou vídeos do problema, se possível. Isso ajuda a equipe de manutenção a diagnosticar o problema mais rápido.</li>
                        <li>Clique em <strong>"Enviar Ordem de Serviço"</strong>.</li>
                    </ul>

                     <h3 className="text-xl font-bold text-brand-blue mt-6 mb-2">Acompanhando Suas OS</h3>
                     <ul className="list-disc list-inside space-y-2">
                        <li>No menu, clique em <strong>"Minhas OS"</strong>.</li>
                        <li>Você verá suas OS separadas por abas: <strong>Novas</strong>, <strong>Em Aberto</strong> e <strong>Finalizadas</strong>.</li>
                        <li>Você pode editar ou excluir uma OS apenas se ela estiver na aba "Novas" (ou seja, a manutenção ainda não iniciou o atendimento).</li>
                     </ul>
                </AccordionItem>
                
                {isMaintenanceOrHigher && (
                    <AccordionItem title="Guia para Equipe de Manutenção">
                        <h3 className="text-xl font-bold text-brand-blue mb-2">Atendendo uma OS</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Acesse <strong>"Ordens de Serviço"</strong> no menu para ver todas as OS abertas na fábrica.</li>
                            <li>As OS na aba <strong>"Novas"</strong> estão aguardando atendimento. Priorize as que têm status <strong className="text-machine-down">INOPERANTE</strong>.</li>
                            <li>Ao escolher uma OS para trabalhar, clique nela e depois no botão <strong>"Iniciar Atendimento"</strong>. Isso move a OS para a aba "Em Aberto" e começa a contar o tempo de reparo.</li>
                        </ul>
                        
                         <h3 className="text-xl font-bold text-brand-blue mt-6 mb-2">Finalizando uma OS</h3>
                         <ul className="list-disc list-inside space-y-2">
                             <li>Após resolver o problema, abra a OS na aba "Em Aberto" e clique em <strong>"Concluir"</strong>.</li>
                             <li>Na janela que abrir, descreva detalhadamente o serviço realizado no campo <strong>"O que foi feito?"</strong>.</li>
                             <li>Se for uma OS Preventiva, preencha o <strong>Checklist</strong> marcando todos os itens verificados.</li>
                             <li>Informe quem finalizou o serviço e confirme. A OS será movida para a lista de "Finalizadas".</li>
                             <li><strong>Alterar Data de Conclusão:</strong> Se precisar registrar a conclusão com uma data/hora passada (ex: por falta de internet), marque a opção, selecione a data/hora correta e escreva uma justificativa. A conclusão ficará pendente de <strong>aprovação de um gestor</strong>.</li>
                         </ul>
                    </AccordionItem>
                )}
                
                {isManagerOrAdmin && (
                    <AccordionItem title="Guia para Gestores">
                        <h3 className="text-xl font-bold text-brand-blue mb-2">Utilizando o Dashboard</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>O <strong>Dashboard</strong> é sua central de indicadores (KPIs).</li>
                            <li>Acompanhe em tempo real os <strong>Novos Pedidos</strong>, OS <strong>Em Atendimento</strong> e, mais importante, o número de <strong>Máquinas Paradas</strong>.</li>
                            <li>A tabela de <strong>Análise de Confiabilidade</strong> é sua principal ferramenta de gestão. Ela mostra:
                                <ul>
                                    <li><strong>MTTR (Tempo Médio Para Reparo):</strong> Quanto tempo, em média, a equipe leva para consertar um equipamento. Um MTTR baixo indica eficiência.</li>
                                    <li><strong>MTBF (Tempo Médio Entre Falhas):</strong> Quanto tempo, em média, um equipamento funciona sem quebrar. Um MTBF alto indica confiabilidade.</li>
                                </ul>
                            </li>
                            <li>Use o filtro de <strong>Setor</strong> para analisar a performance de áreas específicas da fábrica.</li>
                        </ul>
                        
                        <h3 className="text-xl font-bold text-brand-blue mt-6 mb-2">Fluxo de Aprovações</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Acesse a tela <strong>"Aprovações"</strong> no menu.</li>
                            <li><strong>Aprovação de Preventivas:</strong> O sistema gera OS preventivas automaticamente. Você deve aprová-las aqui para que elas entrem na fila de trabalho da manutenção.</li>
                            <li><strong>Aprovação de Conclusão:</strong> Se um técnico registrar uma conclusão com data/hora retroativa, você precisará aprovar ou rejeitar essa alteração aqui para garantir a precisão dos dados.</li>
                        </ul>
                    </AccordionItem>
                )}

                {isAdmin && (
                    <AccordionItem title="Guia para Administradores (Admin)">
                         <p>O perfil de <strong>Admin</strong> possui todas as permissões de um <strong>Gestor</strong>, mais a capacidade de gerenciar os usuários do sistema.</p>
                         <h3 className="text-xl font-bold text-brand-blue mt-6 mb-2">Como Gerenciar Usuários</h3>
                         <ul className="list-disc list-inside space-y-2">
                            <li>No menu lateral, clique em <strong>"Gerenciar Usuários"</strong>.</li>
                            <li><strong>Para criar um usuário:</strong> Use o formulário à esquerda. Preencha o nome, selecione o perfil de acesso (Role) e defina uma senha inicial.</li>
                            <li><strong>Para ver e editar usuários:</strong> A tabela à direita lista todos os usuários cadastrados.</li>
                            <li>Clique no ícone de <strong>lápis</strong> para editar o nome ou o perfil de um usuário. <strong className="text-red-600">Atenção:</strong> Você não pode alterar seu próprio perfil.</li>
                            <li>Clique no ícone de <strong>lixeira</strong> para excluir um usuário. <strong className="text-red-600">Atenção:</strong> Você não pode excluir a si mesmo.</li>
                         </ul>
                    </AccordionItem>
                )}

                 <AccordionItem title="Recursos Gerais (Para Todos os Perfis)">
                    <h3 className="text-xl font-bold text-brand-blue mb-2">Editando Seu Perfil</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li>No canto superior direito, clique no seu nome para abrir o menu de usuário.</li>
                        <li>Selecione <strong>"Meu Perfil"</strong>.</li>
                        <li>Nesta página, você pode atualizar seu nome completo, seu setor e definir uma nova senha.</li>
                        <li>Seu "Perfil de Acesso" (Solicitante, Gestor, etc.) não pode ser alterado por você. Apenas um Admin pode fazer isso.</li>
                    </ul>
                     <h3 className="text-xl font-bold text-brand-blue mt-6 mb-2">Saindo do Sistema (Logout)</h3>
                    <ul className="list-disc list-inside space-y-2">
                       <li>Clique no seu nome no canto superior direito.</li>
                       <li>Selecione a opção <strong>"Sair"</strong>.</li>
                    </ul>
                </AccordionItem>

            </div>
        </div>
    );
};

export default TutorialPage;