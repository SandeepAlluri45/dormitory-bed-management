import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="sidebar">
        <div class="logo">
          <span class="material-icons">hotel</span>
          <h1>DormManager</h1>
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="material-icons">dashboard</span>
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/beds" routerLinkActive="active">
              <span class="material-icons">bed</span>
              Beds
            </a>
          </li>
          <li>
            <a routerLink="/customers" routerLinkActive="active">
              <span class="material-icons">people</span>
              Customers
            </a>
          </li>
          <li>
            <a routerLink="/allocations" routerLinkActive="active">
              <span class="material-icons">assignment</span>
              Allocations
            </a>
          </li>
        </ul>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%);
      color: white;
      padding: 20px 0;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px 30px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 20px;
    }

    .logo .material-icons {
      font-size: 32px;
      color: #60a5fa;
    }

    .logo h1 {
      font-size: 1.4rem;
      font-weight: 600;
    }

    .nav-links {
      list-style: none;
      padding: 0 12px;
    }

    .nav-links li {
      margin-bottom: 4px;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .nav-links a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-links a.active {
      background: rgba(96, 165, 250, 0.2);
      color: #60a5fa;
    }

    .nav-links .material-icons {
      font-size: 22px;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 30px;
      background: #f5f7fa;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'Dormitory Bed Management';
}
