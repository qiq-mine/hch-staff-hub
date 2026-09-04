const { mockData } = require('./mock-data.cjs');

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD' || !req.on) {
      return resolve(req.body && typeof req.body === 'object' ? req.body : {});
    }
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({ raw: data });
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end(JSON.stringify(payload));
}

function sendSseEvent(res, eventName, data) {
  res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function handleMockRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;
  const body = await parseBody(req);

  // 1. Health check
  if (pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', mock: true, timestamp: new Date().toISOString() });
  }

  // 2. Auth APIs
  if (pathname === '/api/auth/login' && method === 'POST') {
    const username = body.username || 'admin';
    const user = mockData.users.find((u) => u.username === username) || mockData.currentUser;
    return sendJson(res, 200, {
      token: `mock_jwt_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        tenant_id: mockData.tenantId,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    return sendJson(res, 200, mockData.currentUser);
  }

  if (pathname === '/api/auth/me/avatar') {
    if (method === 'POST') {
      mockData.currentUser.avatar_url = 'staffdeck-avatar-default-Cg_vAcCz.png';
      return sendJson(res, 200, mockData.currentUser);
    }
    if (method === 'DELETE') {
      mockData.currentUser.avatar_url = undefined;
      return sendJson(res, 200, { success: true });
    }
  }

  if (pathname === '/api/auth/me/api-credentials') {
    if (method === 'GET') {
      return sendJson(res, 200, [
        {
          id: 'cred_user_1',
          name: '默认开发测试密钥',
          masked_key: 'sd_live_99f2*****************7a1c',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_used_at: new Date().toISOString(),
        },
      ]);
    }
    if (method === 'POST') {
      return sendJson(res, 200, {
        id: `cred_user_${Date.now()}`,
        name: body.name || '新建 API 密钥',
        raw_key: `sd_live_${Math.random().toString(36).slice(2)}${Date.now()}`,
        masked_key: 'sd_live_new*****************key',
        created_at: new Date().toISOString(),
      });
    }
  }

  if (pathname.startsWith('/api/auth/me/api-credentials/') && (pathname.endsWith('/rotate') || pathname.endsWith('/revoke'))) {
    return sendJson(res, 200, { success: true });
  }

  if (pathname === '/api/auth/users') {
    if (method === 'GET') return sendJson(res, 200, mockData.users);
    if (method === 'POST') {
      const newUser = {
        id: `user_${Date.now()}`,
        tenant_id: mockData.tenantId,
        username: body.username || `user_${Date.now()}`,
        display_name: body.display_name || '新成员',
        role: body.role || 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.users.push(newUser);
      return sendJson(res, 200, newUser);
    }
  }

  if (pathname.startsWith('/api/auth/users/')) {
    const id = pathname.split('/').pop();
    if (method === 'PUT') {
      const index = mockData.users.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockData.users[index] = { ...mockData.users[index], ...body, updated_at: new Date().toISOString() };
        return sendJson(res, 200, mockData.users[index]);
      }
      return sendJson(res, 200, { id, ...body });
    }
    if (method === 'DELETE') {
      mockData.users = mockData.users.filter((u) => u.id !== id);
      return sendJson(res, 200, { success: true });
    }
  }

  // 3. Model Configs
  if (pathname === '/api/enterprise/model-configs') {
    if (method === 'GET') return sendJson(res, 200, mockData.models);
    if (method === 'POST') {
      const newModel = {
        id: `model_${Date.now()}`,
        tenant_id: mockData.tenantId,
        name: body.name || '新建模型',
        provider: body.provider || 'openai_compatible',
        base_url: body.base_url || 'https://api.openai.com/v1',
        model_name: body.model_name || 'gpt-4o',
        is_default: false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.models.push(newModel);
      return sendJson(res, 200, newModel);
    }
  }

  if (pathname === '/api/enterprise/model-configs/validate') {
    return sendJson(res, 200, { success: true, latency_ms: 85, model: body.model_name });
  }

  if (pathname.startsWith('/api/enterprise/model-configs/')) {
    const id = pathname.split('/').pop();
    if (method === 'PUT') {
      const idx = mockData.models.findIndex((m) => m.id === id);
      if (idx !== -1) {
        mockData.models[idx] = { ...mockData.models[idx], ...body, updated_at: new Date().toISOString() };
        return sendJson(res, 200, mockData.models[idx]);
      }
      return sendJson(res, 200, { id, ...body });
    }
    if (method === 'DELETE') {
      mockData.models = mockData.models.filter((m) => m.id !== id);
      return sendJson(res, 200, { success: true });
    }
  }

  // 4. Agents (Digital Employees)
  if (pathname === '/api/enterprise/agents') {
    if (method === 'GET') return sendJson(res, 200, mockData.agents);
    if (method === 'POST') {
      const newAgent = {
        id: `agent_${Date.now()}`,
        tenant_id: mockData.tenantId,
        name: body.name || '新建数字员工',
        description: body.description || '专注特定业务的自动化执行员',
        persona_prompt: body.persona_prompt || '你是一名高效负责的数字员工。',
        is_overall: false,
        status: 'active',
        harness_max_actions: 32,
        metadata: {
          avatar: 'staffdeck-avatar-default-Cg_vAcCz.png',
          staff_no: `SD-${Math.floor(1000 + Math.random() * 9000)}`,
          role_title: body.name || '业务助理',
          department: '运营部',
          published_to_gallery: false,
          owner_user_id: 'user_admin',
          ...(body.metadata || {}),
        },
        resources: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.agents.push(newAgent);
      return sendJson(res, 200, newAgent);
    }
  }

  if (pathname.startsWith('/api/enterprise/agents/') && !pathname.includes('/api-credentials')) {
    const agentId = pathname.replace('/api/enterprise/agents/', '').split('/')[0];
    const agent = mockData.agents.find((a) => a.id === agentId);
    if (method === 'GET') {
      return sendJson(res, 200, agent || mockData.agents[0]);
    }
    if (method === 'PUT') {
      if (agent) {
        Object.assign(agent, body, { updated_at: new Date().toISOString() });
        return sendJson(res, 200, agent);
      }
      return sendJson(res, 200, { id: agentId, ...body });
    }
    if (method === 'DELETE') {
      mockData.agents = mockData.agents.filter((a) => a.id !== agentId);
      return sendJson(res, 200, { success: true });
    }
  }

  if (pathname.includes('/api-credentials')) {
    if (method === 'GET') {
      return sendJson(res, 200, [
        { id: 'cred_agent_1', name: '系统运行运行时密钥', masked_key: 'sd_live_8830*****************12ef', created_at: new Date().toISOString() },
      ]);
    }
    if (method === 'POST') {
      return sendJson(res, 200, {
        id: `cred_${Date.now()}`,
        name: body.name || '新建员工密钥',
        raw_key: `sd_live_agent_${Math.random().toString(36).slice(2)}`,
        masked_key: 'sd_live_ag*****************key',
        created_at: new Date().toISOString(),
      });
    }
  }

  // 5. Teams
  if (pathname === '/api/enterprise/teams') {
    if (method === 'GET') return sendJson(res, 200, mockData.teams);
    if (method === 'POST') {
      const newTeam = {
        id: `team_${Date.now()}`,
        tenant_id: mockData.tenantId,
        name: body.name || '新建项目组',
        description: body.description || '',
        owner_user_id: 'user_admin',
        leader_agent_id: body.leader_agent_id || 'agent_tl',
        status: 'active',
        members: [],
        blackboard: [],
        tasks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.teams.push(newTeam);
      return sendJson(res, 200, newTeam);
    }
  }

  if (pathname.startsWith('/api/enterprise/teams/')) {
    const parts = pathname.replace('/api/enterprise/teams/', '').split('/');
    const teamId = parts[0];
    const subRoute = parts[1];
    const team = mockData.teams.find((t) => t.id === teamId) || mockData.teams[0];

    if (!subRoute) {
      if (method === 'GET') return sendJson(res, 200, team);
      if (method === 'PUT') {
        Object.assign(team, body, { updated_at: new Date().toISOString() });
        return sendJson(res, 200, team);
      }
      if (method === 'DELETE') {
        mockData.teams = mockData.teams.filter((t) => t.id !== teamId);
        return sendJson(res, 200, { success: true });
      }
    }

    if (subRoute === 'tl' && parts[2] === 'session') {
      return sendJson(res, 200, { session_id: 'sess_finance_demo' });
    }

    if (subRoute === 'tasks') {
      if (method === 'GET') return sendJson(res, 200, team.tasks || []);
      if (method === 'POST') {
        const newTask = { id: `task_${Date.now()}`, team_id: teamId, title: body.title, description: body.description, status: 'pending', created_at: new Date().toISOString() };
        team.tasks = team.tasks || [];
        team.tasks.push(newTask);
        return sendJson(res, 200, newTask);
      }
    }

    if (subRoute === 'blackboard') {
      if (method === 'GET') return sendJson(res, 200, team.blackboard || []);
      if (method === 'POST') {
        const newEntry = { id: `bb_${Date.now()}`, team_id: teamId, content: body.content, tags: body.tags || [], created_at: new Date().toISOString() };
        team.blackboard = team.blackboard || [];
        team.blackboard.unshift(newEntry);
        return sendJson(res, 200, newEntry);
      }
    }
  }

  // 6. Skills (SOPs) & Distill
  if (pathname === '/api/enterprise/skills') {
    if (method === 'GET') return sendJson(res, 200, mockData.skills);
    if (method === 'POST') {
      const newSkill = {
        id: `sop_${Date.now()}`,
        tenant_id: mockData.tenantId,
        skill_id: `skill_${Date.now()}`,
        name: body.name || '新建流程',
        version: '1.0.0',
        business_domain: body.business_domain || 'general',
        description: body.description || '',
        content: body.content || { nodes: [], edges: [], start_node_id: '', terminal_node_ids: [] },
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.skills.push(newSkill);
      return sendJson(res, 200, newSkill);
    }
  }

  if (pathname === '/api/enterprise/skills/distill') {
    // Return auto-distilled SOP Graph Draft!
    const promptText = body.instruction || body.case_text || '标准业务操作';
    return sendJson(res, 200, {
      skill_id: `sop_distilled_${Date.now()}`,
      name: `提炼流程：${promptText.slice(0, 12)}`,
      version: '1.0.0',
      description: `基于业务案例自动提炼生成的 SOP 状态机：${promptText.slice(0, 40)}`,
      start_node_id: 'node_input',
      terminal_node_ids: ['node_complete', 'node_handoff'],
      trigger_intents: ['业务办理', '处理请求'],
      user_utterance_examples: ['我想办理该业务'],
      goal: ['完成该业务的标准核验与流转'],
      required_info: ['target_id', 'applicant'],
      interruption_policy: { mode: 'retain_context' },
      response_rules: ['核验步骤必须保留审计记录'],
      nodes: [
        {
          node_id: 'node_input',
          name: '信息收集与资质提取',
          type: 'collect_info',
          instruction: '提示用户提交办理所需的基础证明材料与单号。',
          expected_user_info: ['target_id', 'applicant'],
          capability_refs: { general_skill_ids: [], tool_ids: [], knowledge_base_ids: [] },
        },
        {
          node_id: 'node_audit',
          name: '合规校验与标准匹配',
          type: 'action',
          instruction: '比对系统预设规范与准入规则，判断是否满足通过条件。',
          capability_refs: { general_skill_ids: [], tool_ids: ['tool_erp_order'], knowledge_base_ids: ['kb_finance_rules'] },
        },
        {
          node_id: 'node_complete',
          name: '正常通过并归档',
          type: 'action',
          instruction: '生成业务核验成功回执，写入业务系统记录。',
          capability_refs: { general_skill_ids: [], tool_ids: ['tool_erp_order'], knowledge_base_ids: [] },
        },
        {
          node_id: 'node_handoff',
          name: '人工介入复核 (Handoff)',
          type: 'handoff',
          instruction: '触发异常或超过额度上限，推送工单至业务主管。',
          assignee_user_id: 'user_sarah',
          capability_refs: { general_skill_ids: [], tool_ids: [], knowledge_base_ids: [] },
        },
      ],
      edges: [
        { source_node_id: 'node_input', next_node_id: 'node_audit', condition: 'slots_filled' },
        { source_node_id: 'node_audit', next_node_id: 'node_complete', condition: 'valid' },
        { source_node_id: 'node_audit', next_node_id: 'node_handoff', condition: 'need_review' },
      ],
    });
  }

  if (pathname.startsWith('/api/enterprise/skills/')) {
    const id = pathname.replace('/api/enterprise/skills/', '').split('/')[0];
    const skill = mockData.skills.find((s) => s.id === id || s.skill_id === id);
    if (method === 'GET') return sendJson(res, 200, skill || mockData.skills[0]);
    if (method === 'PUT') {
      if (skill) {
        Object.assign(skill, body, { updated_at: new Date().toISOString() });
        return sendJson(res, 200, skill);
      }
      return sendJson(res, 200, { id, ...body });
    }
    if (method === 'DELETE') {
      mockData.skills = mockData.skills.filter((s) => s.id !== id);
      return sendJson(res, 200, { success: true });
    }
  }

  // 7. General Skills
  if (pathname === '/api/enterprise/general-skills') {
    if (method === 'GET') return sendJson(res, 200, mockData.generalSkills);
    if (method === 'POST') {
      const newGs = { id: `gs_${Date.now()}`, tenant_id: mockData.tenantId, slug: `gs_${Date.now()}`, ...body, status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockData.generalSkills.push(newGs);
      return sendJson(res, 200, newGs);
    }
  }

  if (pathname.startsWith('/api/enterprise/general-skills/')) {
    const id = pathname.replace('/api/enterprise/general-skills/', '').split('/')[0];
    const gs = mockData.generalSkills.find((g) => g.id === id || g.slug === id);
    if (method === 'GET') return sendJson(res, 200, gs || mockData.generalSkills[0]);
    if (method === 'PUT') {
      if (gs) {
        Object.assign(gs, body, { updated_at: new Date().toISOString() });
        return sendJson(res, 200, gs);
      }
      return sendJson(res, 200, { id, ...body });
    }
    if (method === 'DELETE') {
      mockData.generalSkills = mockData.generalSkills.filter((g) => g.id !== id);
      return sendJson(res, 200, { success: true });
    }
  }

  // 8. Tools & MCP
  if (pathname === '/api/enterprise/tools') {
    if (method === 'GET') return sendJson(res, 200, mockData.tools);
    if (method === 'POST') {
      const newTool = { id: `tool_${Date.now()}`, tenant_id: mockData.tenantId, status: 'active', ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockData.tools.push(newTool);
      return sendJson(res, 200, newTool);
    }
  }

  if (pathname === '/api/enterprise/tools/test') {
    return sendJson(res, 200, { success: true, status_code: 200, data_preview: { employee_id: 'EMP-01', remaining_quota: 18500.0, pending_balance: 0.0 } });
  }

  if (pathname.startsWith('/api/enterprise/tools/')) {
    const id = pathname.replace('/api/enterprise/tools/', '').split('/')[0];
    const tool = mockData.tools.find((t) => t.id === id);
    if (method === 'GET') return sendJson(res, 200, tool || mockData.tools[0]);
    if (method === 'PUT') {
      if (tool) {
        Object.assign(tool, body, { updated_at: new Date().toISOString() });
        return sendJson(res, 200, tool);
      }
      return sendJson(res, 200, { id, ...body });
    }
    if (method === 'DELETE') {
      mockData.tools = mockData.tools.filter((t) => t.id !== id);
      return sendJson(res, 200, { success: true });
    }
  }

  if (pathname === '/api/enterprise/mcp-servers') {
    if (method === 'GET') return sendJson(res, 200, mockData.mcpServers);
    if (method === 'POST') {
      const newMcp = { id: `mcp_${Date.now()}`, tenant_id: mockData.tenantId, status: 'active', ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockData.mcpServers.push(newMcp);
      return sendJson(res, 200, newMcp);
    }
  }

  // 9. Knowledge Bases
  if (pathname === '/api/enterprise/knowledge-bases') {
    if (method === 'GET') return sendJson(res, 200, mockData.knowledgeBases);
    if (method === 'POST') {
      const newKb = { id: `kb_${Date.now()}`, tenant_id: mockData.tenantId, status: 'published', document_count: 0, bucket_count: 0, chunk_count: 0, ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockData.knowledgeBases.push(newKb);
      return sendJson(res, 200, newKb);
    }
  }

  if (pathname.startsWith('/api/enterprise/knowledge-bases/')) {
    const parts = pathname.replace('/api/enterprise/knowledge-bases/', '').split('/');
    const kbId = parts[0];
    const subRoute = parts[1];
    const kb = mockData.knowledgeBases.find((k) => k.id === kbId) || mockData.knowledgeBases[0];

    if (!subRoute) {
      if (method === 'GET') return sendJson(res, 200, kb);
      if (method === 'PUT') {
        Object.assign(kb, body, { updated_at: new Date().toISOString() });
        return sendJson(res, 200, kb);
      }
      if (method === 'DELETE') {
        mockData.knowledgeBases = mockData.knowledgeBases.filter((k) => k.id !== kbId);
        return sendJson(res, 200, { success: true });
      }
    }

    if (subRoute === 'documents') {
      return sendJson(res, 200, [
        { id: 'doc_1', filename: '2026_差旅报销制度.pdf', file_type: 'pdf', title: '企业差旅与财务报销制度 (2026 版)', status: 'ready', bucket_count: 3, chunk_count: 24, created_at: new Date().toISOString() },
      ]);
    }

    if (subRoute === 'search') {
      return sendJson(res, 200, {
        results: [
          {
            chunk_id: 'chk_1',
            score: 0.92,
            content: '一类海外城市就餐补贴为 65 美元/人/天，需提供带有消费明细的项目水单。',
            source_ref: '《财务报销制度》第 4.2 条',
          },
        ],
      });
    }
  }

  // 10. Channels
  if (pathname === '/api/enterprise/channels') {
    if (method === 'GET') return sendJson(res, 200, mockData.channels);
    if (method === 'POST') {
      const newChan = { id: `chan_${Date.now()}`, tenant_id: mockData.tenantId, status: 'connected', ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockData.channels.push(newChan);
      return sendJson(res, 200, newChan);
    }
  }

  // 11. Scheduled Tasks
  if (pathname === '/api/enterprise/scheduled-tasks') {
    if (method === 'GET') return sendJson(res, 200, mockData.scheduledTasks);
    if (method === 'POST') {
      const newTask = { id: `sched_${Date.now()}`, tenant_id: mockData.tenantId, status: 'active', last_run_status: 'success', ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockData.scheduledTasks.push(newTask);
      return sendJson(res, 200, newTask);
    }
  }

  // 12. Evolution Proposals (PRs)
  if (pathname.includes('/evolution/proposals') && method === 'GET') {
    return sendJson(res, 200, mockData.evolutionProposals);
  }

  if (pathname.includes('/evolution:analyze')) {
    const newProp = {
      id: `evo_prop_${Date.now()}`,
      tenant_id: mockData.tenantId,
      agent_id: 'agent_finance',
      resource_type: 'sop',
      resource_id: 'sop_travel_expense',
      resource_name: '差旅报销合规初审 SOP',
      status: 'ready_for_review',
      risk_level: 'low',
      hypothesis: '优化出差城市发票提示文案，避免用户误解。',
      rationale: '用户对提示语格式存在疑问。',
      expected_outcome: '交互清晰度提升。',
      diff: [{ op: 'replace', path: '/nodes/node_collect_invoice/instruction', before: '旧文案', after: '优化后的清晰指引文案' }],
      evaluation: { passed: true, checks: [{ name: 'schema', passed: true }] },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockData.evolutionProposals.unshift(newProp);
    return sendJson(res, 200, newProp);
  }

  if (pathname.includes('/evolution/proposals/')) {
    const id = pathname.split('/')[5]?.split(':')[0];
    const action = pathname.split(':').pop();
    const prop = mockData.evolutionProposals.find((p) => p.id === id) || mockData.evolutionProposals[0];
    if (action === 'evaluate') {
      prop.status = 'ready_for_review';
      prop.evaluation = { passed: true, evaluated_at: new Date().toISOString() };
      return sendJson(res, 200, prop);
    }
    if (action === 'approve') {
      prop.status = 'published';
      prop.published_at = new Date().toISOString();
      return sendJson(res, 200, prop);
    }
    if (action === 'reject') {
      prop.status = 'rejected';
      return sendJson(res, 200, prop);
    }
    if (action === 'rollback') {
      prop.status = 'rolled_back';
      return sendJson(res, 200, prop);
    }
  }

  // 13. UI & Runtime Config
  if (pathname === '/api/enterprise/ui-config') {
    return sendJson(res, 200, { brand_name: 'StaffDeck', title: '数字员工运营中枢' });
  }

  if (pathname === '/api/enterprise/runtime-settings') {
    return sendJson(res, 200, { default_model: 'model_deepseek_v3', max_concurrent_turns: 10 });
  }

  // 14. Chat APIs
  if (pathname === '/api/chat/sessions') {
    if (method === 'GET') {
      return sendJson(res, 200, mockData.sessions);
    }
    if (method === 'POST') {
      const newSession = {
        id: `sess_${Date.now()}`,
        tenant_id: mockData.tenantId,
        user_id: 'user_admin',
        agent_id: body.agent_id || 'agent_finance',
        title: body.title || '新会话',
        status: 'active',
        updated_at: new Date().toISOString(),
      };
      mockData.sessions.unshift(newSession);
      mockData.messages[newSession.id] = [];
      return sendJson(res, 200, newSession);
    }
  }

  if (pathname.startsWith('/api/chat/sessions/')) {
    const sessionId = pathname.replace('/api/chat/sessions/', '').split('/')[0];
    const session = mockData.sessions.find((s) => s.id === sessionId);

    if (pathname.endsWith('/messages') && method === 'GET') {
      const msgs = mockData.messages[sessionId] || [];
      return sendJson(res, 200, msgs);
    }

    if (method === 'DELETE') {
      mockData.sessions = mockData.sessions.filter((s) => s.id !== sessionId);
      delete mockData.messages[sessionId];
      return sendJson(res, 200, { success: true });
    }

    if (method === 'GET') {
      return sendJson(res, 200, session || mockData.sessions[0]);
    }
  }

  if (pathname.startsWith('/api/chat/agents/') && pathname.endsWith('/use')) {
    const agentId = pathname.replace('/api/chat/agents/', '').replace('/use', '');
    let existing = mockData.sessions.find((s) => s.agent_id === agentId);
    if (!existing) {
      existing = {
        id: `sess_${Date.now()}`,
        tenant_id: mockData.tenantId,
        user_id: 'user_admin',
        agent_id: agentId,
        title: `与数字员工的对话`,
        status: 'active',
        updated_at: new Date().toISOString(),
      };
      mockData.sessions.unshift(existing);
      mockData.messages[existing.id] = [];
    }
    return sendJson(res, 200, existing);
  }

  if (pathname === '/api/chat/attachments' && method === 'POST') {
    return sendJson(res, 200, [
      {
        id: `att_${Date.now()}`,
        filename: '发票扫描件_2026.pdf',
        content_type: 'application/pdf',
        size: 1048576,
        kind: 'pdf',
      },
    ]);
  }

  if (pathname === '/api/feedback/message' || pathname === '/api/feedback/skill') {
    return sendJson(res, 200, { success: true });
  }

  // 15. SSE Streaming Chat Turn (`POST /api/chat/stream`)
  if (pathname === '/api/chat/stream' && method === 'POST') {
    const sessionId = body.session_id || mockData.sessions[0]?.id || 'sess_finance_demo';
    const userMessage = body.message || '你好';
    const turnId = `turn_${Date.now()}`;
    const userMsgId = `msg_user_${Date.now()}`;
    const assistantMsgId = `msg_asst_${Date.now()}`;

    // Record user message
    mockData.messages[sessionId] = mockData.messages[sessionId] || [];
    mockData.messages[sessionId].push({
      id: userMsgId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    });

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    });

    // 1. Session created / verified
    sendSseEvent(res, 'session_created', { sessionId, newSessionId: sessionId });
    sendSseEvent(res, 'user_message_received', { message_id: userMsgId, turn_id: turnId });

    // 2. Decision & Planning Traces
    setTimeout(() => {
      sendSseEvent(res, 'decision_status', {
        phase: 'planning',
        status: 'running',
        turn_id: turnId,
        user_intent: '差旅报销与合规初审',
        reason: '命中 SOP 流程技能：travel_expense_audit',
      });
    }, 100);

    setTimeout(() => {
      sendSseEvent(res, 'decision_status', {
        phase: 'stepping',
        status: 'running',
        turn_id: turnId,
        step: 'node_validate_amount',
        message: '调用知识库匹配《企业差旅报销制度 (2026版)》',
      });
    }, 300);

    // 3. Response Generation (Typewriter Stream)
    const replyText =
      `您好！我是您的智能财务核算专员 **Sarah**。\n\n针对您提出的需求：“*${userMessage}*”，已为您完成合规性初审比对：\n\n` +
      `1. **合规核验结果**：根据公司《企业差旅与财务报销制度 (2026 版)》第 4.2 条规定 [1]，所附餐饮及交通标准均在属地限额范围内；\n` +
      `2. **ERP 预制单状态**：已通过 ERP 接口完成预算额度预占，在途报销凭单草稿已生成；\n` +
      `3. **后续建议**：请在 3 个工作日内将纸质发票贴签交由财务前台归档，系统将自动推进划款流程。\n\n` +
      `如需对某项金额有疑问或需要修改报销项目，请随时告诉我！`;

    const chunks = replyText.match(/.{1,4}/g) || [replyText];
    let chunkIndex = 0;

    const streamInterval = setInterval(() => {
      if (chunkIndex < chunks.length) {
        sendSseEvent(res, 'stream_delta', {
          content: chunks[chunkIndex],
          turn_id: turnId,
        });
        chunkIndex++;
      } else {
        clearInterval(streamInterval);

        // Record assistant message
        mockData.messages[sessionId].push({
          id: assistantMsgId,
          role: 'assistant',
          content: replyText,
          metadata: {
            knowledge_citations: [
              {
                id: 'cite_1',
                label: '《财务报销制度》第 4.2 条',
                title: '差旅津贴与发票限额核验标准',
                excerpt: '员工出差期间餐饮与交通费用按出差地等级限额据实核销。',
              },
            ],
          },
          created_at: new Date().toISOString(),
        });

        // 4. Complete Event
        sendSseEvent(res, 'complete', {
          session_id: sessionId,
          turn_id: turnId,
          reply: replyText,
          router_decision: {
            user_intent: '差旅报销与合规初审',
            reason: '命中 SOP 流程技能：travel_expense_audit',
          },
          step_result: { action: 'reply' },
          knowledge_citations: [
            {
              id: 'cite_1',
              label: '《财务报销制度》第 4.2 条',
              title: '差旅津贴与发票限额核验标准',
              excerpt: '员工出差期间餐饮与交通费用按出差地等级限额据实核销。',
            },
          ],
        });

        // 5. Stream End
        sendSseEvent(res, 'stream_end', { turn_id: turnId });
        res.end();
      }
    }, 40);

    return;
  }

  // 16. Sync Chat Turn fallback
  if (pathname === '/api/chat/turn' && method === 'POST') {
    const replyText = `[Mock 回复] 已收到并处理您的消息：“${body.message}”。`;
    return sendJson(res, 200, {
      reply: replyText,
      session_id: body.session_id || 'sess_finance_demo',
      step_result: { action: 'reply' },
      session_state: {},
    });
  }

  // Fallback 404
  return sendJson(res, 404, {
    error: 'MOCK_ROUTE_NOT_FOUND',
    message: `Mock API route not implemented for ${method} ${pathname}`,
  });
}

module.exports = { handleMockRequest };
