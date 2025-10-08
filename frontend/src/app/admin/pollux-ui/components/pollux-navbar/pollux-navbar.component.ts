import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pollux-navbar',
  templateUrl: './pollux-navbar.component.html',
  styleUrls: ['./pollux-navbar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PolluxNavbarComponent {
  currentUser = { fullName: 'Admin User', avatar: 'assets/faces/face5.jpg' };
  unreadMessages = 2;
  unreadNotifications = 3;
  recentMessages = [
    { sender: 'David Grey', preview: 'The meeting is cancelled', avatar: 'assets/faces/face4.jpg' },
    { sender: 'Stella', preview: 'New order received', avatar: 'assets/faces/face2.jpg' }
  ];
  recentNotifications = [
    { title: 'New user registered', time: '2 min ago', type: 'success', icon: 'typcn-user' },
    { title: 'Server rebooted', time: '10 min ago', type: 'warning', icon: 'typcn-server' }
  ];
  getLastLoginTime() { return '23 hours ago'; }
  getCurrentDate() { return new Date().toLocaleDateString(); }
  onLogout() { /* logout logic */ }
  toggleSidebar() { /* sidebar logic */ }
}
