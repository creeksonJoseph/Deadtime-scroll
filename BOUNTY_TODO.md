# DeadTime Bounty System - Implementation TODO

## 🎯 Phase 1: MVP Foundation (Week 1-2)

### **Database Schema & Backend** ✅ BOLT.NEW COMPATIBLE
- [x] ~~Create bounty tables migration~~ **WORKAROUND: Use existing tables**
  - [x] Bounties stored as projects with category "BOUNTY"
  - [x] Submissions stored as revivals
  - [x] Comments use existing comment system
  - [x] Reward amounts stored as blessing_count / 100
- [x] ~~Create Supabase RLS policies~~ **EXISTING: Use current policies**
  - [x] Public read for projects (bounties)
  - [x] Creator-only edit permissions work
  - [x] Submission ownership via revivals
- [x] Seed sample bounty data **COMPLETED**
  - [x] 6 bounties created (2.5-10 ETH rewards)
  - [x] 2 submissions with winner status

### **Smart Contract Development**
- [ ] Create BountyEscrow.sol contract
  - [ ] Basic escrow functionality
  - [ ] Create bounty with ETH deposit
  - [ ] Distribute payout to winners
  - [ ] Refund mechanism for expired bounties
  - [ ] Emergency cancel with platform fee
- [ ] Deploy to Scroll Mainnet
- [ ] Verify contract on explorer
- [ ] Test all contract functions

### **Core Services**
- [x] Create `bountyServiceSimple.ts` **BOLT.NEW COMPATIBLE**
  - [x] CRUD operations using existing tables
  - [x] Submission management via revivals
  - [x] Status tracking via blessing counts
- [ ] Create `bountyEscrowService.ts`
  - [ ] Contract interaction functions
  - [ ] ETH deposit handling
  - [ ] Payout distribution
- [x] ~~Update existing services~~ **NOT NEEDED**
  - [x] Bounties work through existing project system
  - [x] Comments work through existing system

## 🎨 Phase 2: User Interface (Week 2-3)

### **Navigation & Routing**
- [ ] Add "Bounties" to sidebar navigation
- [ ] Create bounty routes in App.tsx
  - [ ] `/bounties` - Browse all bounties
  - [ ] `/bounties/create` - Post new bounty
  - [ ] `/bounties/:id` - Bounty detail page
  - [ ] `/bounties/:id/manage` - Creator management
  - [ ] `/bounties/:id/submit` - Developer submission

### **Bounty List Page**
- [ ] Create `BountyListPage.tsx`
  - [ ] Grid layout with bounty cards
  - [ ] Filter by status (open, judging, completed)
  - [ ] Filter by reward amount
  - [ ] Search by title/description
  - [ ] Sort by deadline, reward, created date
- [ ] Design bounty card component
  - [ ] Show reward amount prominently
  - [ ] Display deadline countdown
  - [ ] Show submission count
  - [ ] Creator profile info

### **Create Bounty Page**
- [ ] Create `CreateBountyPage.tsx`
  - [ ] Form with title, description, requirements
  - [ ] ETH amount input with USD conversion
  - [ ] Deadline picker
  - [ ] Category selection
  - [ ] Preview mode
- [ ] Wallet integration
  - [ ] Connect wallet requirement
  - [ ] ETH balance check
  - [ ] Transaction confirmation
  - [ ] Success/error handling

### **Bounty Detail Page**
- [ ] Create `BountyDetailPage.tsx`
  - [ ] Full bounty information display
  - [ ] Submission list for creators
  - [ ] Submit solution button for developers
  - [ ] Comment section
  - [ ] Status indicators
- [ ] Different views for creators vs developers
- [ ] Real-time updates for status changes

## 💰 Phase 3: Submission & Payout System (Week 3-4)

### **Submission Management**
- [ ] Create `SubmissionPage.tsx`
  - [ ] GitHub repo URL input
  - [ ] Demo/live site URL input
  - [ ] Description textarea
  - [ ] File upload for screenshots
  - [ ] Submission preview
- [ ] Create `ManageBountyPage.tsx`
  - [ ] View all submissions
  - [ ] Rate/comment on submissions
  - [ ] Select winner interface
  - [ ] Payout distribution UI

### **Payout Integration**
- [ ] Integrate smart contract calls
  - [ ] Winner selection triggers payout
  - [ ] Handle multiple winners
  - [ ] Platform fee calculation
  - [ ] Transaction status tracking
- [ ] Create payout confirmation flow
  - [ ] Review winners and amounts
  - [ ] Confirm transaction
  - [ ] Success notification
  - [ ] Update database status

### **Notification System**
- [ ] Email notifications (optional)
- [ ] In-app notifications
  - [ ] New submissions for creators
  - [ ] Winner announcements
  - [ ] Payout confirmations
  - [ ] Deadline reminders

## 🎮 Phase 4: Gamification & Polish (Week 4-5)

### **Badge System Integration**
- [ ] Create bounty-specific badges
  - [ ] "Bounty Hunter" - First win
  - [ ] "Big Winner" - Win >1 ETH bounty
  - [ ] "Sponsor" - Create first bounty
  - [ ] "Generous Sponsor" - Fund >10 ETH total
- [ ] Update badge minting for bounty achievements
- [ ] Display bounty stats on profiles

### **Enhanced Features**
- [ ] Bounty categories/tags
- [ ] Advanced search and filters
- [ ] Bounty templates for common requests
- [ ] Submission drafts (save progress)
- [ ] Bounty sharing (social media)

### **Analytics Dashboard**
- [ ] Creator dashboard
  - [ ] Bounty performance metrics
  - [ ] Submission quality scores
  - [ ] Developer engagement stats
- [ ] Developer dashboard
  - [ ] Earnings tracking
  - [ ] Win rate statistics
  - [ ] Skill reputation scores

## 🔧 Phase 5: Testing & Optimization (Week 5-6)

### **Testing**
- [ ] Unit tests for bounty services
- [ ] Integration tests for smart contract
- [ ] E2E tests for complete bounty flow
- [ ] Load testing for concurrent users
- [ ] Security audit of smart contract

### **Performance Optimization**
- [ ] Database query optimization
- [ ] Image optimization for submissions
- [ ] Caching for bounty lists
- [ ] Mobile responsiveness
- [ ] Loading state improvements

### **Security & Validation**
- [ ] Input validation and sanitization
- [ ] Rate limiting for submissions
- [ ] Spam prevention measures
- [ ] Wallet signature verification
- [ ] Contract interaction security

## 📱 Phase 6: Mobile & Polish (Week 6+)

### **Mobile Optimization**
- [ ] Responsive design for all bounty pages
- [ ] Touch-friendly submission interface
- [ ] Mobile wallet integration
- [ ] Optimized image uploads

### **Advanced Features**
- [ ] Bounty templates
- [ ] Bulk bounty creation
- [ ] Team submissions
- [ ] Milestone-based bounties
- [ ] Recurring bounties

## 🚀 Deployment Checklist

### **Pre-Launch**
- [ ] Smart contract deployed and verified
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Error monitoring setup
- [ ] Analytics tracking implemented

### **Launch**
- [ ] Deploy to production
- [ ] Update README with bounty features
- [ ] Create launch announcement
- [ ] Monitor for issues
- [ ] Gather user feedback

## 📊 Success Metrics to Track

### **Engagement Metrics**
- [ ] Number of bounties created
- [ ] Number of submissions received
- [ ] Completion rate (bounties with winners)
- [ ] Average time to completion
- [ ] Repeat creator/developer rate

### **Financial Metrics**
- [ ] Total ETH distributed
- [ ] Platform fees collected
- [ ] Average bounty amount
- [ ] Payout success rate
- [ ] Gas cost optimization

### **Quality Metrics**
- [ ] Creator satisfaction scores
- [ ] Developer earnings distribution
- [ ] Submission quality ratings
- [ ] Dispute resolution rate
- [ ] Community engagement levels

---

## 🎯 Priority Order

**Week 1**: Database + Smart Contract
**Week 2**: Core UI (List, Create, Detail pages)
**Week 3**: Submission system + Payouts
**Week 4**: Polish + Gamification
**Week 5**: Testing + Security
**Week 6**: Launch preparation

**Estimated Timeline**: 6 weeks for full MVP
**Team Size**: 1-2 developers
**Budget**: Gas costs + testing ETH (~0.5 ETH)