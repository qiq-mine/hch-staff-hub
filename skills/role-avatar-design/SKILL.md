---
name: role-avatar-design
description: >-
  Standard design guidelines, prompt engineering recipes, asset libraries, and React components for generating and managing minimalist Japanese editorial line-art role avatars (Noritake and Yu Nagaba style) for enterprise digital employees, departments (HR, R&D, Finance, Product, Operations, etc.), and organizational personas. Use when designing, rendering, expanding, or integrating departmental role avatars.
---

# Role Avatar Design & Digital Persona Skill

This skill defines the end-to-end design methodology, visual DNA standards, AI prompt generation recipes, and React integration components for enterprise role avatars. It follows a clean, modern **Japanese editorial flat line-art aesthetic** (inspired by artists like Noritake and Yu Nagaba), providing human warmth, approachability, and unified visual consistency across digital employees.

---

## 1. Quick Asset Inventory

All production-ready avatar assets are available in both high-resolution PNG (`1024x1024`) and optimized web sizes (`256x256`, WebP) in [`resources/`](./resources) and [`frontend-service/src/assets/teamerhub/`](../../frontend-service/src/assets/teamerhub/):

| Role | Department | Primary Asset File | Accent Color | Iconic Prop / Characteristic |
| :--- | :--- | :--- | :--- | :--- |
| **HR Specialist** | 人力资源 (HR) | [`hr-manager.png`](./resources/hr-manager.png) | Peach Coral (`#E88B7D`) | Floating Employee ID Card with silhouette |
| **R&D Engineer** | 研发中心 (R&D) | [`rd-engineer.png`](./resources/rd-engineer.png) | Slate Black (`#2D3748`) | Round wireframe glasses + Code card `</>` |
| **Finance Analyst** | 财务部 (Finance) | [`financial-analyst.png`](./resources/financial-analyst.png) | Warm Amber (`#F59E0B`) | Collared shirt + Bar chart & ledger card |
| **Product Manager** | 产品部 (Product) | [`product-manager.png`](./resources/product-manager.png) | Olive Khaki (`#849368`) | Ponytail hair + Agile Kanban board card |
| **Frontend Dev** | 基础工程 (Frontend) | [`frontend-engineer.png`](./resources/frontend-engineer.png) | Cornflower Blue (`#7294CB`) | High bun hair + Mobile UI screen card |
| **Software Arch** | 核心架构 (Arch) | [`software-architect.png`](./resources/software-architect.png) | Charcoal (`#1A1A1A`) | Chin stubble + Thoughtful hand-to-chin pose |

---

## 2. Visual DNA & Design Rules

To ensure any new generated role blends into the existing team:

1. **Linework (墨线)**:
   * Uniform, unmodulated black ink contour line (`#1A1A1A`).
   * Continuous organic curves with rounded terminals; zero sketchy or fragmented strokes.
2. **Facial Minimalism (面部极简)**:
   * **Eyes**: Solid black oval dots / beads.
   * **Nose**: A single minimal hook or angle.
   * **Mouth**: A single relaxed curve expressing calm confidence.
   * **Ear**: Rounded outer curve with a distinctive **`+` sign** representing the inner ear canal.
   * **Jaw Shadow**: Distinct flat triangular gray shadow (`#D1D5DB`) directly under the chin.
   * **Cheek**: Optional subtle circular blush circle.
3. **Role Identifier Prop (角色背景悬浮卡片)**:
   * A clean 2D card floated slightly behind the shoulder with rounded corners (`border-radius: 12px`).
   * Contains a minimalist, functional representation of that role's domain (e.g., Code tags, Kanban sticky notes, Financial charts, Wireframes).
4. **Color Distribution**:
   * Pure off-white background (`#F9FAFB`).
   * Charcoal/black base clothing (`#18181B` - `#27272A`).
   * **One dominant muted/pastel accent color** per persona (hair or prop).

For complete technical specifications, see [Style Guide](./references/style-guide.md).

---

## 3. How to Generate New Roles (Prompt Recipe)

To create a new role avatar with consistent aesthetic quality, use the master prompt formula in [Prompt Engineering](./references/prompt-engineering.md):

```text
Minimalist flat line-art avatar portrait of a {gender} {role_title} in the exact art style of Japanese editorial minimalist flat line illustration (Noritake and Yu Nagaba style). Thick clean black ink contour lines, simple black oval bead eyes, calm and approachable expression, small hook nose, ear with a small plus sign detail, flat gray triangular shadow under the jawline. {hair_style} with soft {hair_color} accent color, wearing {clothing_style}. In the background behind {pronoun} shoulder, a minimalist floating card showing {role_prop_description}. Off-white plain solid background, flat 2D vector graphic look, clean portrait bust, centered composition.
```

Pre-tested prompt templates are ready in [prompt-engineering.md](./references/prompt-engineering.md) for:
* Operations Manager (运营专家)
* Marketing Specialist (市场增长专家)
* Legal Counsel (法务总监)
* Data Scientist / AI Researcher (数据科学家)
* QA / Security Engineer (测试与安全工程师)

---

## 4. Frontend Integration (React & TypeScript)

A production-ready avatar component is provided in [`examples/RoleAvatar.tsx`](./examples/RoleAvatar.tsx).

### Usage:

```tsx
import { RoleAvatar } from '@/skills/role-avatar-design/examples/RoleAvatar';

// 1. Department Team Member Card
export function StaffCard() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-xs border border-zinc-200">
      <RoleAvatar role="hr" size="lg" shape="squircle" />
      <div>
        <h4 className="font-semibold text-zinc-900">Sarah Chen</h4>
        <p className="text-xs text-zinc-500">People & Talent Operations</p>
      </div>
    </div>
  );
}

// 2. Chat / Agent Message Avatar
export function AgentMessage() {
  return (
    <div className="flex gap-2">
      <RoleAvatar role="rd" size="sm" shape="circle" />
      <div className="bg-zinc-100 rounded-lg p-3 text-sm">
        Analyzing repository dependencies...
      </div>
    </div>
  );
}
```

---

## 5. Asset Pipeline & Automation

Use [`scripts/process_avatars.py`](./scripts/process_avatars.py) to automatically process newly generated avatar images, generate 256px web thumbnails, WebP compression, and sync directly to `frontend-service`:

```bash
python skills/role-avatar-design/scripts/process_avatars.py
```

---

## 6. Interactive Visual Gallery

Open [`examples/avatar-showcase.html`](./examples/avatar-showcase.html) in your browser to inspect all avatars side-by-side with role cards and prop definitions.

