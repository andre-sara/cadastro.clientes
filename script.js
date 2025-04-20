
// Configuração inicial do aplicativo
document.addEventListener('DOMContentLoaded', function() {
  // Inicialização de dados
  initializeApp();
  
  // Configuração de eventos
  setupEventListeners();
  
  // Verificar e aplicar tema
  applyTheme();
});

// Inicializar dados do aplicativo
function initializeApp() {
  // Verificar se já existem dados de usuários
  if (!localStorage.getItem('users')) {
    // Criar usuários padrão
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin', lastLogin: null },
      { username: 'operador', password: 'operador123', role: 'operator', lastLogin: null }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
  
  // Verificar se já existem dados de clientes
  if (!localStorage.getItem('clients')) {
    // Criar alguns clientes de exemplo
    const sampleClients = [
      {
        id: 1,
        name: 'João Silva',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        phone: '(11) 98765-4321',
        address: 'Rua das Flores, 123',
        notes: 'Cliente desde 2020',
        pendingAmount: 150.00,
        lastPurchase: '2023-05-15'
      },
      {
        id: 2,
        name: 'Maria Oliveira',
        cpf: '987.654.321-00',
        rg: '98.765.432-1',
        phone: '(11) 91234-5678',
        address: 'Avenida Central, 456',
        notes: 'Cliente VIP',
        pendingAmount: 0,
        lastPurchase: '2023-06-01'
      }
    ];
    localStorage.setItem('clients', JSON.stringify(sampleClients));
  }
  
  // Verificar se já existem dados de pagamentos
  if (!localStorage.getItem('payments')) {
    // Criar alguns pagamentos de exemplo
    const currentDate = new Date().toISOString().split('T')[0];
    const samplePayments = [
      {
        id: 1,
        clientId: 1,
        value: 50.00,
        type: 'cash',
        date: currentDate,
        dueDate: null,
        status: 'paid',
        notes: 'Pagamento parcial'
      },
      {
        id: 2,
        clientId: 1,
        value: 150.00,
        type: 'credit',
        date: '2023-06-01',
        dueDate: '2023-07-01',
        status: 'pending',
        notes: 'Parcela 1/3'
      }
    ];
    localStorage.setItem('payments', JSON.stringify(samplePayments));
  }
  
  // Verificar se existem configurações do sistema
  if (!localStorage.getItem('settings')) {
    const defaultSettings = {
      storeName: 'FinanceMercado',
      defaultTheme: 'light'
    };
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
  }
  
  // Atualizar contadores do dashboard
  updateDashboardStats();
  
  // Carregar lista de clientes e pagamentos
  loadClientsList();
  loadPaymentsList();
  loadRecentPayments();
  loadPendingClients();
  
  // Preencher selects de clientes
  populateClientSelects();
}

// Configuração de todos os ouvintes de eventos
function setupEventListeners() {
  // Login e Autenticação
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('forgot-password-link').addEventListener('click', function() {
    showScreen('recovery-screen');
  });
  document.getElementById('back-to-login').addEventListener('click', function() {
    showScreen('login-screen');
  });
  document.getElementById('recovery-btn').addEventListener('click', handlePasswordRecovery);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Alternância de modo escuro
  document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
  
  // Navegação
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      
      // Remover classe ativa de todos os links
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      
      // Adicionar classe ativa ao link clicado
      this.classList.add('active');
      
      // Mostrar página correspondente
      showPage(page);
    });
  });
  
  // Botões de fechar modais
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      hideModal(modal.id);
    });
  });
  
  // Botão OK do modal de alerta
  document.getElementById('alert-ok').addEventListener('click', function() {
    hideModal('alert-modal');
  });
  
  // Abas na página de administração
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remover classe ativa de todos os botões e conteúdos
      tabButtons.forEach(tabBtn => tabBtn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Adicionar classe ativa ao botão clicado e conteúdo correspondente
      this.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Tipo de pagamento (mostrar/ocultar data de vencimento)
  document.getElementById('payment-type').addEventListener('change', function() {
    const dueDateGroup = document.getElementById('due-date-group');
    dueDateGroup.style.display = this.value === 'credit' ? 'block' : 'none';
  });
  
  // Tipo de relatório (mostrar/ocultar campos específicos)
  document.getElementById('report-type').addEventListener('change', function() {
    const monthGroup = document.getElementById('report-month-group');
    const clientGroup = document.getElementById('report-client-group');
    
    monthGroup.style.display = this.value === 'monthly' ? 'block' : 'none';
    clientGroup.style.display = this.value === 'client' ? 'block' : 'none';
  });
  
  // Botões de ação
  document.getElementById('register-client-btn').addEventListener('click', registerClient);
  document.getElementById('register-payment-btn').addEventListener('click', registerPayment);
  document.getElementById('generate-report-btn').addEventListener('click', generateReport);
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  
  // Buscas
  document.getElementById('client-search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterClientsList(searchTerm);
  });
  
  document.getElementById('payment-search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterPaymentsList(searchTerm);
  });
}

// Alternar entre telas (login, dashboard, etc)
function showScreen(screenId) {
  // Ocultar todas as telas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Mostrar a tela selecionada
  document.getElementById(screenId).classList.add('active');
}

// Alternar entre páginas do dashboard
function showPage(pageId) {
  // Ocultar todas as páginas
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Mostrar a página selecionada
  document.getElementById(pageId + '-page').classList.add('active');
}

// Funções de Modal
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function showAlert(title, message) {
  document.getElementById('alert-title').textContent = title;
  document.getElementById('alert-message').textContent = message;
  showModal('alert-modal');
}

function showConfirm(message, onConfirm) {
  document.getElementById('confirm-message').textContent = message;
  
  // Remover listeners antigos
  const confirmBtn = document.getElementById('confirm-yes');
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  // Adicionar novo listener
  newConfirmBtn.addEventListener('click', function() {
    onConfirm();
    hideModal('confirm-modal');
  });
  
  document.getElementById('confirm-no').addEventListener('click', function() {
    hideModal('confirm-modal');
  });
  
  showModal('confirm-modal');
}

// Autenticação
function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showAlert('Erro de Login', 'Por favor, preencha todos os campos.');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Login bem-sucedido
    localStorage.setItem('currentUser', JSON.stringify({
      username: user.username,
      role: user.role
    }));
    
    // Atualizar último login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));
    
    // Exibir ou ocultar link de admin
    document.getElementById('admin-link').style.display = user.role === 'admin' ? 'block' : 'none';
    
    // Mostrar nome do usuário
    document.getElementById('username-display').textContent = user.username;
    
    // Ir para o dashboard
    showScreen('dashboard-screen');
  } else {
    showAlert('Erro de Login', 'Usuário ou senha incorretos.');
  }
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  showScreen('login-screen');
  
  // Limpar campos de login
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

function handlePasswordRecovery() {
  const email = document.getElementById('recovery-email').value;
  
  if (!email) {
    showAlert('Erro', 'Por favor, digite seu e-mail.');
    return;
  }
  
  // Simulação de recuperação (na prática, enviaria e-mail)
  showAlert('Recuperação de Senha', 'Se este e-mail estiver cadastrado, você receberá as instruções de recuperação.');
  
  // Voltar para tela de login
  setTimeout(() => {
    hideModal('alert-modal');
    showScreen('login-screen');
  }, 3000);
}

// Tema escuro
function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  
  // Atualizar ícone
  const darkModeIcon = document.querySelector('#dark-mode-toggle i');
  darkModeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  
  // Salvar preferência no localStorage
  settings.theme = isDarkMode ? 'dark' : 'light';
  localStorage.setItem('settings', JSON.stringify(settings));
}

function applyTheme() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  
  if (settings.theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.querySelector('#dark-mode-toggle i').className = 'fas fa-sun';
  } else {
    document.body.classList.remove('dark-mode');
    document.querySelector('#dark-mode-toggle i').className = 'fas fa-moon';
  }
}

// Gestão de Clientes
function registerClient() {
  const name = document.getElementById('client-name').value;
  const cpf = document.getElementById('client-cpf').value;
  const rg = document.getElementById('client-rg').value;
  const phone = document.getElementById('client-phone').value;
  const address = document.getElementById('client-address').value;
  const notes = document.getElementById('client-notes').value;
  
  if (!name || !cpf || !phone) {
    showAlert('Erro', 'Por favor, preencha os campos obrigatórios.');
    return;
  }
  
  // Carregar lista de clientes e verificar CPF duplicado
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  if (clients.some(client => client.cpf === cpf)) {
    showAlert('Erro', 'CPF já cadastrado no sistema.');
    return;
  }
  
  // Gerar ID único
  const newId = clients.length > 0 ? Math.max(...clients.map(client => client.id)) + 1 : 1;
  
  // Criar novo cliente
  const newClient = {
    id: newId,
    name,
    cpf,
    rg,
    phone,
    address,
    notes,
    pendingAmount: 0,
    lastPurchase: null
  };
  
  // Adicionar à lista e salvar
  clients.push(newClient);
  localStorage.setItem('clients', JSON.stringify(clients));
  
  // Atualizar listas
  loadClientsList();
  populateClientSelects();
  updateDashboardStats();
  
  // Limpar formulário
  document.getElementById('client-name').value = '';
  document.getElementById('client-cpf').value = '';
  document.getElementById('client-rg').value = '';
  document.getElementById('client-phone').value = '';
  document.getElementById('client-address').value = '';
  document.getElementById('client-notes').value = '';
  
  showAlert('Sucesso', 'Cliente cadastrado com sucesso!');
}

function loadClientsList() {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const clientsList = document.getElementById('clients-list');
  clientsList.innerHTML = '';
  
  clients.forEach(client => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${client.name}</td>
      <td>${client.cpf}</td>
      <td>${client.phone}</td>
      <td>R$ ${client.pendingAmount.toFixed(2)}</td>
      <td>
        <button class="icon-btn view-client" data-id="${client.id}"><i class="fas fa-eye"></i></button>
        <button class="icon-btn edit-client" data-id="${client.id}"><i class="fas fa-edit"></i></button>
        <button class="icon-btn delete-client" data-id="${client.id}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    clientsList.appendChild(row);
  });
  
  // Adicionar eventos aos botões
  document.querySelectorAll('.view-client').forEach(btn => {
    btn.addEventListener('click', function() {
      const clientId = parseInt(this.getAttribute('data-id'));
      showClientDetails(clientId);
    });
  });
  
  document.querySelectorAll('.edit-client').forEach(btn => {
    btn.addEventListener('click', function() {
      const clientId = parseInt(this.getAttribute('data-id'));
      editClient(clientId);
    });
  });
  
  document.querySelectorAll('.delete-client').forEach(btn => {
    btn.addEventListener('click', function() {
      const clientId = parseInt(this.getAttribute('data-id'));
      deleteClient(clientId);
    });
  });
}

function filterClientsList(searchTerm) {
  const rows = document.querySelectorAll('#clients-list tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function showClientDetails(clientId) {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const client = clients.find(c => c.id === clientId);
  
  if (!client) {
    showAlert('Erro', 'Cliente não encontrado.');
    return;
  }
  
  // Buscar histórico de pagamentos do cliente
  const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    .filter(p => p.clientId === clientId);
  
  let paymentsHtml = '<p>Nenhum pagamento registrado.</p>';
  
  if (payments.length > 0) {
    paymentsHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    payments.forEach(payment => {
      const paymentType = payment.type === 'cash' ? 'À Vista' : 'A Prazo';
      const statusClass = payment.status === 'paid' ? 'status-paid' : 'status-pending';
      const statusText = payment.status === 'paid' ? 'Pago' : 'Pendente';
      
      paymentsHtml += `
        <tr>
          <td>${formatDate(payment.date)}</td>
          <td>R$ ${payment.value.toFixed(2)}</td>
          <td>${paymentType}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });
    
    paymentsHtml += '</tbody></table>';
  }
  
  // Montar HTML com detalhes do cliente
  const detailsHtml = `
    <div class="client-info">
      <p><strong>Nome:</strong> ${client.name}</p>
      <p><strong>CPF:</strong> ${client.cpf}</p>
      <p><strong>RG:</strong> ${client.rg || 'Não informado'}</p>
      <p><strong>Telefone:</strong> ${client.phone}</p>
      <p><strong>Endereço:</strong> ${client.address || 'Não informado'}</p>
      <p><strong>Saldo Pendente:</strong> R$ ${client.pendingAmount.toFixed(2)}</p>
      <p><strong>Observações:</strong> ${client.notes || 'Nenhuma observação'}</p>
    </div>
    
    <h3>Histórico de Pagamentos</h3>
    <div class="payments-history">
      ${paymentsHtml}
    </div>
  `;
  
  document.getElementById('client-details').innerHTML = detailsHtml;
  showModal('client-details-modal');
}

function editClient(clientId) {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const client = clients.find(c => c.id === clientId);
  
  if (!client) {
    showAlert('Erro', 'Cliente não encontrado.');
    return;
  }
  
  // Criar formulário de edição na modal
  const formHtml = `
    <div class="form-container">
      <div class="input-group">
        <label for="edit-name">Nome Completo</label>
        <input type="text" id="edit-name" value="${client.name}" required>
      </div>
      
      <div class="input-group">
        <label for="edit-cpf">CPF</label>
        <input type="text" id="edit-cpf" value="${client.cpf}" required>
      </div>
      
      <div class="input-group">
        <label for="edit-rg">RG</label>
        <input type="text" id="edit-rg" value="${client.rg || ''}">
      </div>
      
      <div class="input-group">
        <label for="edit-phone">Telefone</label>
        <input type="text" id="edit-phone" value="${client.phone}" required>
      </div>
      
      <div class="input-group">
        <label for="edit-address">Endereço</label>
        <textarea id="edit-address">${client.address || ''}</textarea>
      </div>
      
      <div class="input-group">
        <label for="edit-notes">Observações</label>
        <textarea id="edit-notes">${client.notes || ''}</textarea>
      </div>
      
      <button id="save-edit-btn" class="primary-btn">Salvar Alterações</button>
    </div>
  `;
  
  document.getElementById('client-details').innerHTML = formHtml;
  showModal('client-details-modal');
  
  // Adicionar evento ao botão de salvar
  document.getElementById('save-edit-btn').addEventListener('click', function() {
    const name = document.getElementById('edit-name').value;
    const cpf = document.getElementById('edit-cpf').value;
    const rg = document.getElementById('edit-rg').value;
    const phone = document.getElementById('edit-phone').value;
    const address = document.getElementById('edit-address').value;
    const notes = document.getElementById('edit-notes').value;
    
    if (!name || !cpf || !phone) {
      showAlert('Erro', 'Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    // Verificar se outro cliente já tem este CPF
    const cpfExists = clients.some(c => c.cpf === cpf && c.id !== clientId);
    
    if (cpfExists) {
      showAlert('Erro', 'CPF já cadastrado para outro cliente.');
      return;
    }
    
    // Atualizar dados do cliente
    const index = clients.findIndex(c => c.id === clientId);
    clients[index] = {
      ...client,
      name,
      cpf,
      rg,
      phone,
      address,
      notes
    };
    
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Atualizar lista e fechar modal
    loadClientsList();
    hideModal('client-details-modal');
    showAlert('Sucesso', 'Cliente atualizado com sucesso!');
  });
}

function deleteClient(clientId) {
  showConfirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.', function() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    // Verificar se há pagamentos pendentes
    const hasPendingPayments = payments.some(p => p.clientId === clientId && p.status === 'pending');
    
    if (hasPendingPayments) {
      showAlert('Aviso', 'Este cliente possui pagamentos pendentes e não pode ser excluído.');
      return;
    }
    
    // Remover cliente
    const updatedClients = clients.filter(c => c.id !== clientId);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    
    // Atualizar lista
    loadClientsList();
    updateDashboardStats();
    showAlert('Sucesso', 'Cliente excluído com sucesso!');
  });
}

// Gestão de Pagamentos
function registerPayment() {
  const clientId = parseInt(document.getElementById('payment-client').value);
  const value = parseFloat(document.getElementById('payment-value').value);
  const type = document.getElementById('payment-type').value;
  const dueDate = type === 'credit' ? document.getElementById('payment-due-date').value : null;
  const notes = document.getElementById('payment-notes').value;
  
  if (!clientId || isNaN(value) || value <= 0) {
    showAlert('Erro', 'Por favor, preencha todos os campos corretamente.');
    return;
  }
  
  if (type === 'credit' && !dueDate) {
    showAlert('Erro', 'Por favor, informe a data de vencimento.');
    return;
  }
  
  // Carregar dados
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  // Encontrar cliente
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1) {
    showAlert('Erro', 'Cliente não encontrado.');
    return;
  }
  
  // Gerar ID único
  const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
  
  // Data atual
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Status inicial
  const status = type === 'cash' ? 'paid' : 'pending';
  
  // Criar novo pagamento
  const newPayment = {
    id: newId,
    clientId,
    value,
    type,
    date: currentDate,
    dueDate,
    status,
    notes
  };
  
  // Adicionar à lista e salvar
  payments.push(newPayment);
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Atualizar saldo pendente do cliente
  if (type === 'credit') {
    clients[clientIndex].pendingAmount += value;
  }
  
  // Atualizar data da última compra
  clients[clientIndex].lastPurchase = currentDate;
  
  localStorage.setItem('clients', JSON.stringify(clients));
  
  // Atualizar listas
  loadPaymentsList();
  loadClientsList();
  loadRecentPayments();
  loadPendingClients();
  updateDashboardStats();
  
  // Limpar formulário
  document.getElementById('payment-client').value = '';
  document.getElementById('payment-value').value = '';
  document.getElementById('payment-type').value = 'cash';
  document.getElementById('payment-due-date').value = '';
  document.getElementById('payment-notes').value = '';
  document.getElementById('due-date-group').style.display = 'none';
  
  showAlert('Sucesso', 'Pagamento registrado com sucesso!');
}

function loadPaymentsList() {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const paymentsList = document.getElementById('payments-list');
  
  paymentsList.innerHTML = '';
  
  payments.forEach(payment => {
    const client = clients.find(c => c.id === payment.clientId);
    const clientName = client ? client.name : 'Cliente desconhecido';
    
    const row = document.createElement('tr');
    
    const paymentType = payment.type === 'cash' ? 'À Vista' : 'A Prazo';
    const statusClass = payment.status === 'paid' ? 'status-paid' : 
                        (payment.status === 'pending' ? 'status-pending' : 'status-late');
    const statusText = payment.status === 'paid' ? 'Pago' : 
                      (payment.status === 'pending' ? 'Pendente' : 'Atrasado');
    
    row.innerHTML = `
      <td>${payment.id}</td>
      <td>${clientName}</td>
      <td>R$ ${payment.value.toFixed(2)}</td>
      <td>${paymentType}</td>
      <td>${formatDate(payment.date)}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>
        <button class="icon-btn view-payment" data-id="${payment.id}"><i class="fas fa-eye"></i></button>
        <button class="icon-btn receive-payment" data-id="${payment.id}" ${payment.status === 'paid' ? 'disabled' : ''}><i class="fas fa-check"></i></button>
        <button class="icon-btn delete-payment" data-id="${payment.id}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    paymentsList.appendChild(row);
  });
  
  // Adicionar eventos aos botões
  document.querySelectorAll('.view-payment').forEach(btn => {
    btn.addEventListener('click', function() {
      const paymentId = parseInt(this.getAttribute('data-id'));
      showPaymentDetails(paymentId);
    });
  });
  
  document.querySelectorAll('.receive-payment').forEach(btn => {
    btn.addEventListener('click', function() {
      const paymentId = parseInt(this.getAttribute('data-id'));
      receivePayment(paymentId);
    });
  });
  
  document.querySelectorAll('.delete-payment').forEach(btn => {
    btn.addEventListener('click', function() {
      const paymentId = parseInt(this.getAttribute('data-id'));
      deletePayment(paymentId);
    });
  });
}

function filterPaymentsList(searchTerm) {
  const rows = document.querySelectorAll('#payments-list tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function showPaymentDetails(paymentId) {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) {
    showAlert('Erro', 'Pagamento não encontrado.');
    return;
  }
  
  const client = clients.find(c => c.id === payment.clientId);
  const clientName = client ? client.name : 'Cliente desconhecido';
  
  const paymentType = payment.type === 'cash' ? 'À Vista' : 'A Prazo';
  const statusClass = payment.status === 'paid' ? 'status-paid' : 
                      (payment.status === 'pending' ? 'status-pending' : 'status-late');
  const statusText = payment.status === 'paid' ? 'Pago' : 
                    (payment.status === 'pending' ? 'Pendente' : 'Atrasado');
  
  const detailsHtml = `
    <div class="payment-info">
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Valor:</strong> R$ ${payment.value.toFixed(2)}</p>
      <p><strong>Tipo:</strong> ${paymentType}</p>
      <p><strong>Data de Registro:</strong> ${formatDate(payment.date)}</p>
      ${payment.dueDate ? `<p><strong>Data de Vencimento:</strong> ${formatDate(payment.dueDate)}</p>` : ''}
      <p><strong>Status:</strong> <span class="status ${statusClass}">${statusText}</span></p>
      <p><strong>Observações:</strong> ${payment.notes || 'Nenhuma observação'}</p>
    </div>
  `;
  
  document.getElementById('payment-details').innerHTML = detailsHtml;
  showModal('payment-details-modal');
}

function receivePayment(paymentId) {
  showConfirm('Confirmar recebimento deste pagamento?', function() {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Encontrar o pagamento
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      showAlert('Erro', 'Pagamento não encontrado.');
      return;
    }
    
    const payment = payments[paymentIndex];
    
    // Verificar se já está pago
    if (payment.status === 'paid') {
      showAlert('Aviso', 'Este pagamento já foi recebido.');
      return;
    }
    
    // Encontrar o cliente
    const clientIndex = clients.findIndex(c => c.id === payment.clientId);
    
    // Atualizar saldo pendente do cliente
    if (clientIndex !== -1 && payment.type === 'credit') {
      clients[clientIndex].pendingAmount -= payment.value;
      // Evitar valores negativos
      if (clients[clientIndex].pendingAmount < 0) {
        clients[clientIndex].pendingAmount = 0;
      }
      localStorage.setItem('clients', JSON.stringify(clients));
    }
    
    // Atualizar status do pagamento
    payments[paymentIndex].status = 'paid';
    payments[paymentIndex].paymentDate = new Date().toISOString().split('T')[0];
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Atualizar listas
    loadPaymentsList();
    loadClientsList();
    loadRecentPayments();
    loadPendingClients();
    updateDashboardStats();
    
    showAlert('Sucesso', 'Pagamento recebido com sucesso!');
  });
}

function deletePayment(paymentId) {
  showConfirm('Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.', function() {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Encontrar o pagamento
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
      showAlert('Erro', 'Pagamento não encontrado.');
      return;
    }
    
    // Se for a prazo e estiver pendente, atualizar saldo do cliente
    if (payment.type === 'credit' && payment.status === 'pending') {
      const clientIndex = clients.findIndex(c => c.id === payment.clientId);
      
      if (clientIndex !== -1) {
        clients[clientIndex].pendingAmount -= payment.value;
        // Evitar valores negativos
        if (clients[clientIndex].pendingAmount < 0) {
          clients[clientIndex].pendingAmount = 0;
        }
        localStorage.setItem('clients', JSON.stringify(clients));
      }
    }
    
    // Remover pagamento
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    
    // Atualizar listas
    loadPaymentsList();
    loadClientsList();
    loadRecentPayments();
    loadPendingClients();
    updateDashboardStats();
    
    showAlert('Sucesso', 'Pagamento excluído com sucesso!');
  });
}

// Relatórios
function generateReport() {
  const reportType = document.getElementById('report-type').value;
  const reportMonth = document.getElementById('report-month').value;
  const reportClient = document.getElementById('report-client').value;
  const reportResult = document.getElementById('report-result');
  
  // Validar campos
  if (reportType === 'monthly' && !reportMonth) {
    showAlert('Erro', 'Por favor, selecione um mês.');
    return;
  }
  
  if (reportType === 'client' && !reportClient) {
    showAlert('Erro', 'Por favor, selecione um cliente.');
    return;
  }
  
  // Carregar dados
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  let reportHtml = '';
  let filteredPayments = [];
  
  // Filtrar por tipo de relatório
  if (reportType === 'monthly') {
    const [year, month] = reportMonth.split('-');
    filteredPayments = payments.filter(p => {
      return p.date.startsWith(`${year}-${month}`);
    });
    
    reportHtml = generateMonthlyReport(filteredPayments, clients, `${month}/${year}`);
  } else if (reportType === 'client') {
    const clientId = parseInt(reportClient);
    filteredPayments = payments.filter(p => p.clientId === clientId);
    
    const client = clients.find(c => c.id === clientId);
    reportHtml = generateClientReport(filteredPayments, client);
  } else if (reportType === 'pending') {
    filteredPayments = payments.filter(p => p.status === 'pending');
    reportHtml = generatePendingReport(filteredPayments, clients);
  }
  
  reportResult.innerHTML = reportHtml;
}

function generateMonthlyReport(payments, clients, period) {
  let totalPaid = 0;
  let totalPending = 0;
  
  payments.forEach(p => {
    if (p.status === 'paid') {
      totalPaid += p.value;
    } else {
      totalPending += p.value;
    }
  });
  
  // Agrupar por cliente
  const clientPayments = {};
  
  payments.forEach(p => {
    const clientId = p.clientId;
    
    if (!clientPayments[clientId]) {
      clientPayments[clientId] = {
        paid: 0,
        pending: 0,
        total: 0
      };
    }
    
    clientPayments[clientId].total += p.value;
    
    if (p.status === 'paid') {
      clientPayments[clientId].paid += p.value;
    } else {
      clientPayments[clientId].pending += p.value;
    }
  });
  
  // Gerar tabela de clientes
  let clientsTable = '';
  
  if (Object.keys(clientPayments).length > 0) {
    clientsTable = `
      <h3>Pagamentos por Cliente</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Pagos</th>
            <th>Pendentes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    Object.keys(clientPayments).forEach(clientId => {
      const client = clients.find(c => c.id === parseInt(clientId));
      const clientName = client ? client.name : 'Cliente desconhecido';
      const data = clientPayments[clientId];
      
      clientsTable += `
        <tr>
          <td>${clientName}</td>
          <td>R$ ${data.paid.toFixed(2)}</td>
          <td>R$ ${data.pending.toFixed(2)}</td>
          <td>R$ ${data.total.toFixed(2)}</td>
        </tr>
      `;
    });
    
    clientsTable += '</tbody></table>';
  }
  
  // Gerar detalhes dos pagamentos
  let paymentsTable = '';
  
  if (payments.length > 0) {
    paymentsTable = `
      <h3>Detalhes dos Pagamentos</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    payments.forEach(payment => {
      const client = clients.find(c => c.id === payment.clientId);
      const clientName = client ? client.name : 'Cliente desconhecido';
      
      const paymentType = payment.type === 'cash' ? 'À Vista' : 'A Prazo';
      const statusClass = payment.status === 'paid' ? 'status-paid' : 'status-pending';
      const statusText = payment.status === 'paid' ? 'Pago' : 'Pendente';
      
      paymentsTable += `
        <tr>
          <td>${formatDate(payment.date)}</td>
          <td>${clientName}</td>
          <td>R$ ${payment.value.toFixed(2)}</td>
          <td>${paymentType}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });
    
    paymentsTable += '</tbody></table>';
  }
  
  return `
    <h2>Relatório Mensal - ${period}</h2>
    
    <div class="report-summary">
      <div class="stats-container">
        <div class="stat-card">
          <h3>Total Pago</h3>
          <p class="stat-number">R$ ${totalPaid.toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Total Pendente</h3>
          <p class="stat-number">R$ ${totalPending.toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Total Geral</h3>
          <p class="stat-number">R$ ${(totalPaid + totalPending).toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Quantidade</h3>
          <p class="stat-number">${payments.length}</p>
        </div>
      </div>
    </div>
    
    ${clientsTable}
    ${paymentsTable}
    
    <div class="report-actions">
      <button class="secondary-btn" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
    </div>
  `;
}

function generateClientReport(payments, client) {
  if (!client) {
    return '<p>Cliente não encontrado.</p>';
  }
  
  let totalPaid = 0;
  let totalPending = 0;
  
  payments.forEach(p => {
    if (p.status === 'paid') {
      totalPaid += p.value;
    } else {
      totalPending += p.value;
    }
  });
  
  // Gerar detalhes dos pagamentos
  let paymentsTable = '';
  
  if (payments.length > 0) {
    paymentsTable = `
      <h3>Detalhes dos Pagamentos</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    payments.forEach(payment => {
      const paymentType = payment.type === 'cash' ? 'À Vista' : 'A Prazo';
      const statusClass = payment.status === 'paid' ? 'status-paid' : 'status-pending';
      const statusText = payment.status === 'paid' ? 'Pago' : 'Pendente';
      
      paymentsTable += `
        <tr>
          <td>${formatDate(payment.date)}</td>
          <td>R$ ${payment.value.toFixed(2)}</td>
          <td>${paymentType}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td>${payment.notes || '-'}</td>
        </tr>
      `;
    });
    
    paymentsTable += '</tbody></table>';
  } else {
    paymentsTable = '<p>Nenhum pagamento registrado para este cliente.</p>';
  }
  
  return `
    <h2>Relatório de Cliente - ${client.name}</h2>
    
    <div class="client-details">
      <p><strong>CPF:</strong> ${client.cpf}</p>
      <p><strong>Telefone:</strong> ${client.phone}</p>
      <p><strong>Endereço:</strong> ${client.address || '-'}</p>
    </div>
    
    <div class="report-summary">
      <div class="stats-container">
        <div class="stat-card">
          <h3>Total Pago</h3>
          <p class="stat-number">R$ ${totalPaid.toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Total Pendente</h3>
          <p class="stat-number">R$ ${totalPending.toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Total Geral</h3>
          <p class="stat-number">R$ ${(totalPaid + totalPending).toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Quantidade</h3>
          <p class="stat-number">${payments.length}</p>
        </div>
      </div>
    </div>
    
    ${paymentsTable}
    
    <div class="report-actions">
      <button class="secondary-btn" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
    </div>
  `;
}

function generatePendingReport(payments, clients) {
  let totalPending = 0;
  
  payments.forEach(p => {
    totalPending += p.value;
  });
  
  // Agrupar por cliente
  const clientPayments = {};
  
  payments.forEach(p => {
    const clientId = p.clientId;
    
    if (!clientPayments[clientId]) {
      clientPayments[clientId] = {
        count: 0,
        total: 0
      };
    }
    
    clientPayments[clientId].count++;
    clientPayments[clientId].total += p.value;
  });
  
  // Gerar tabela de clientes
  let clientsTable = '';
  
  if (Object.keys(clientPayments).length > 0) {
    clientsTable = `
      <h3>Pendências por Cliente</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Telefone</th>
            <th>Quantidade</th>
            <th>Total Pendente</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    Object.keys(clientPayments).forEach(clientId => {
      const client = clients.find(c => c.id === parseInt(clientId));
      const clientName = client ? client.name : 'Cliente desconhecido';
      const clientPhone = client ? client.phone : '-';
      const data = clientPayments[clientId];
      
      clientsTable += `
        <tr>
          <td>${clientName}</td>
          <td>${clientPhone}</td>
          <td>${data.count}</td>
          <td>R$ ${data.total.toFixed(2)}</td>
        </tr>
      `;
    });
    
    clientsTable += '</tbody></table>';
  }
  
  // Gerar detalhes dos pagamentos
  let paymentsTable = '';
  
  if (payments.length > 0) {
    paymentsTable = `
      <h3>Detalhes dos Pagamentos Pendentes</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Data de Registro</th>
            <th>Vencimento</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    payments.forEach(payment => {
      const client = clients.find(c => c.id === payment.clientId);
      const clientName = client ? client.name : 'Cliente desconhecido';
      
      const today = new Date();
      const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
      
      let situation = 'No prazo';
      let situationClass = 'status-pending';
      
      if (dueDate && dueDate < today) {
        situation = 'Atrasado';
        situationClass = 'status-late';
      }
      
      paymentsTable += `
        <tr>
          <td>${clientName}</td>
          <td>R$ ${payment.value.toFixed(2)}</td>
          <td>${formatDate(payment.date)}</td>
          <td>${payment.dueDate ? formatDate(payment.dueDate) : '-'}</td>
          <td><span class="status ${situationClass}">${situation}</span></td>
        </tr>
      `;
    });
    
    paymentsTable += '</tbody></table>';
  }
  
  return `
    <h2>Relatório de Pendências</h2>
    
    <div class="report-summary">
      <div class="stats-container">
        <div class="stat-card">
          <h3>Total Pendente</h3>
          <p class="stat-number">R$ ${totalPending.toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Clientes Devedores</h3>
          <p class="stat-number">${Object.keys(clientPayments).length}</p>
        </div>
        <div class="stat-card">
          <h3>Pagamentos Pendentes</h3>
          <p class="stat-number">${payments.length}</p>
        </div>
      </div>
    </div>
    
    ${clientsTable}
    ${paymentsTable}
    
    <div class="report-actions">
      <button class="secondary-btn" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
    </div>
  `;
}

// Configurações
function saveSettings() {
  const storeName = document.getElementById('store-name').value;
  const defaultTheme = document.getElementById('default-theme').value;
  
  const settings = {
    storeName: storeName || 'FinanceMercado',
    defaultTheme
  };
  
  localStorage.setItem('settings', JSON.stringify(settings));
  
  // Aplicar tema
  if (defaultTheme === 'dark' && !document.body.classList.contains('dark-mode')) {
    document.body.classList.add('dark-mode');
    document.querySelector('#dark-mode-toggle i').className = 'fas fa-sun';
  } else if (defaultTheme === 'light' && document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    document.querySelector('#dark-mode-toggle i').className = 'fas fa-moon';
  }
  
  showAlert('Sucesso', 'Configurações salvas com sucesso!');
}

// Funções do Dashboard
function updateDashboardStats() {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  
  // Contagem de clientes
  document.getElementById('client-count').textContent = clients.length;
  
  // Contagem de pagamentos pendentes
  const pendingPayments = payments.filter(p => p.status === 'pending');
  document.getElementById('pending-count').textContent = pendingPayments.length;
  
  // Pagamentos de hoje
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = payments.filter(p => p.date === today);
  document.getElementById('today-count').textContent = todayPayments.length;
  
  // Total recebido no mês atual
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
  
  const monthPayments = payments.filter(p => 
    p.status === 'paid' && p.date.startsWith(monthPrefix)
  );
  
  let monthTotal = 0;
  monthPayments.forEach(p => {
    monthTotal += p.value;
  });
  
  document.getElementById('month-total').textContent = `R$ ${monthTotal.toFixed(2)}`;
}

function loadRecentPayments() {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const recentPaymentsList = document.getElementById('recent-payments');
  
  recentPaymentsList.innerHTML = '';
  
  // Ordenar por data (mais recentes primeiro)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  if (recentPayments.length === 0) {
    recentPaymentsList.innerHTML = '<tr><td colspan="4">Nenhum pagamento registrado.</td></tr>';
    return;
  }
  
  recentPayments.forEach(payment => {
    const client = clients.find(c => c.id === payment.clientId);
    const clientName = client ? client.name : 'Cliente desconhecido';
    
    const row = document.createElement('tr');
    
    const statusClass = payment.status === 'paid' ? 'status-paid' : 'status-pending';
    const statusText = payment.status === 'paid' ? 'Pago' : 'Pendente';
    
    row.innerHTML = `
      <td>${clientName}</td>
      <td>R$ ${payment.value.toFixed(2)}</td>
      <td>${formatDate(payment.date)}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
    `;
    
    recentPaymentsList.appendChild(row);
  });
}

function loadPendingClients() {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const pendingClientsList = document.getElementById('pending-clients');
  
  pendingClientsList.innerHTML = '';
  
  // Filtrar clientes com pendências
  const pendingClients = clients.filter(c => c.pendingAmount > 0);
  
  if (pendingClients.length === 0) {
    pendingClientsList.innerHTML = '<tr><td colspan="4">Nenhuma pendência encontrada.</td></tr>';
    return;
  }
  
  // Ordenar por valor (maior para menor)
  pendingClients.sort((a, b) => b.pendingAmount - a.pendingAmount);
  
  // Exibir apenas os 5 primeiros
  const topPendingClients = pendingClients.slice(0, 5);
  
  topPendingClients.forEach(client => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${client.name}</td>
      <td>R$ ${client.pendingAmount.toFixed(2)}</td>
      <td>${client.lastPurchase ? formatDate(client.lastPurchase) : '-'}</td>
      <td>
        <button class="icon-btn view-client" data-id="${client.id}"><i class="fas fa-eye"></i></button>
      </td>
    `;
    
    pendingClientsList.appendChild(row);
  });
  
  // Adicionar eventos aos botões
  document.querySelectorAll('#pending-clients .view-client').forEach(btn => {
    btn.addEventListener('click', function() {
      const clientId = parseInt(this.getAttribute('data-id'));
      showClientDetails(clientId);
    });
  });
}

// Utilitários
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function populateClientSelects() {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const selects = [
    document.getElementById('payment-client'),
    document.getElementById('report-client')
  ];
  
  selects.forEach(select => {
    if (!select) return;
    
    // Limpar opções existentes (exceto a primeira)
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Adicionar clientes
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = `${client.name} (${client.cpf})`;
      select.appendChild(option);
    });
  });
}

// Verificar se um usuário está logado ao carregar a página
window.addEventListener('load', function() {
  const currentUser = localStorage.getItem('currentUser');
  
  if (currentUser) {
    const user = JSON.parse(currentUser);
    
    // Exibir ou ocultar link de admin
    document.getElementById('admin-link').style.display = user.role === 'admin' ? 'block' : 'none';
    
    // Mostrar nome do usuário
    document.getElementById('username-display').textContent = user.username;
    
    // Ir para o dashboard
    showScreen('dashboard-screen');
  } else {
    showScreen('login-screen');
  }
});
