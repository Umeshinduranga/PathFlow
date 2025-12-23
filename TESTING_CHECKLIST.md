# ✅ Progress Tracking - Testing Checklist

## Pre-Test Setup
- [ ] Make sure MongoDB is running
- [ ] Backend server is running (`cd server && npm start`)
- [ ] Frontend is running (`cd client && npm start`)
- [ ] You are logged in with a valid account

## Backend API Tests

### Test 1: Generate and Save Path
1. [ ] Go to Home or Generate Path page
2. [ ] Enter skills: "JavaScript, React"
3. [ ] Enter goal: "Full Stack Developer"
4. [ ] Click "Generate Path"
5. [ ] Check server logs for: "✅ Learning path saved to database for user [username]"

### Test 2: Fetch My Paths
1. [ ] Navigate to "📚 My Learning" page
2. [ ] Should see statistics cards at top
3. [ ] Should see your generated path(s) in cards
4. [ ] Check if progress shows 0% (not started)

### Test 3: View Path Details
1. [ ] Click on any path card
2. [ ] Modal should open with full details
3. [ ] Should see all 6 steps with empty checkboxes
4. [ ] Progress bar should show 0%

### Test 4: Toggle Step Completion
1. [ ] In the modal, click checkbox for Step 1
2. [ ] Checkbox should fill with checkmark ✓
3. [ ] Text should strikethrough
4. [ ] Progress bar should update to 17% (1/6)
5. [ ] Click same checkbox again to uncheck
6. [ ] Should return to 0%

### Test 5: Complete Multiple Steps
1. [ ] Check Steps 1, 2, and 3
2. [ ] Progress should be 50% (3/6)
3. [ ] Close modal
4. [ ] Path card should show 50% on main page

### Test 6: Filter Paths
1. [ ] Click "In Progress" filter
2. [ ] Should only show paths with 1-99% completion
3. [ ] Click "Completed" filter
4. [ ] Should show empty state (no completed paths yet)
5. [ ] Complete all 6 steps of a path
6. [ ] Click "Completed" filter again
7. [ ] Should now show the completed path

### Test 7: Sort Paths
1. [ ] Generate 2-3 more paths
2. [ ] Click sort dropdown
3. [ ] Select "Progress" - highest % first
4. [ ] Select "Name (A-Z)" - alphabetical

### Test 8: Delete Path
1. [ ] Hover over a path card
2. [ ] Click 🗑️ delete icon
3. [ ] Confirmation modal should appear
4. [ ] Click "Delete"
5. [ ] Path should disappear from list

## Frontend UI Tests

### Test 9: Statistics Update
1. [ ] Create 3 new paths
2. [ ] Complete 1 path fully (100%)
3. [ ] Partially complete another path (50%)
4. [ ] Leave one at 0%
5. [ ] Statistics should show:
   - Total Paths: 3
   - In Progress: 1
   - Completed: 1
   - Steps Done: X/18 (X depends on completion)

### Test 10: Empty States
1. [ ] Delete all your paths
2. [ ] Should see "No Learning Paths Yet" message
3. [ ] Click "Generate Learning Path" button
4. [ ] Should redirect to home page

### Test 11: Responsive Design
1. [ ] Resize browser to mobile width (< 600px)
2. [ ] Navigation should still work
3. [ ] Path cards should stack vertically
4. [ ] Modal should be scrollable
5. [ ] Statistics cards should stack

### Test 12: Navigation
1. [ ] Click "📚 My Learning" in nav bar
2. [ ] Should navigate to `/my-learning`
3. [ ] Click "Home" - should go back to home
4. [ ] Click "Generate Path" - should go to generate form

## Error Handling Tests

### Test 13: Expired Token
1. [ ] Clear localStorage token
2. [ ] Reload "My Learning" page
3. [ ] Should show error message
4. [ ] Should prompt to log in

### Test 14: Network Error
1. [ ] Stop backend server
2. [ ] Try to toggle step completion
3. [ ] Should show error message
4. [ ] Restart server and try again

### Test 15: Invalid Path ID
1. [ ] Open browser console
2. [ ] Try to access: `/api/paths/invalid-id-123`
3. [ ] Should return 404 or 500 error
4. [ ] Frontend should handle gracefully

## Performance Tests

### Test 16: Many Paths
1. [ ] Generate 10+ learning paths
2. [ ] My Learning page should load quickly
3. [ ] Filters should work smoothly
4. [ ] Scrolling should be smooth

### Test 17: Long Path Names
1. [ ] Create path with goal: "Senior Full Stack Software Engineer with DevOps and Cloud Architecture Expertise"
2. [ ] Create path with many skills: "JavaScript, TypeScript, React, Vue, Angular, Node.js, Python, Django, Flask, Java, Spring Boot"
3. [ ] UI should handle gracefully (truncate or wrap)

## Integration Tests

### Test 18: Profile Page Integration
1. [ ] Go to Profile page
2. [ ] Should show total paths count
3. [ ] Should show completion rate
4. [ ] Should match My Learning stats

### Test 19: Dashboard Integration
1. [ ] Go to Dashboard
2. [ ] Should show recent paths
3. [ ] Paths should match those in My Learning

### Test 20: Multi-User Test
1. [ ] Log in as User 1
2. [ ] Create 2 paths
3. [ ] Log out
4. [ ] Log in as User 2
5. [ ] Create 3 paths
6. [ ] User 2 should NOT see User 1's paths
7. [ ] Log back in as User 1
8. [ ] User 1 should see only their 2 paths

## Expected Results Summary

✅ **All tests passing means:**
- Backend API working correctly
- Frontend UI rendering properly
- Authentication secure
- Progress tracking accurate
- Database queries correct
- Error handling robust

## Common Issues & Fixes

### Issue: "Cannot GET /api/paths/my-paths"
**Fix:** Make sure `pathsRoutes` is imported and mounted in `server/index.js`

### Issue: Steps not updating
**Fix:** Check if `completedSteps` is initialized as empty array in database

### Issue: "jwt malformed" error
**Fix:** Clear localStorage and log in again

### Issue: Paths not showing after generation
**Fix:** Check server logs - MongoDB might not be connected

### Issue: UI looks broken
**Fix:** Clear browser cache and reload

---

**🎯 Testing Status:**
- [ ] All Backend Tests Passed (8/8)
- [ ] All Frontend Tests Passed (12/12)
- [ ] All Integration Tests Passed (3/3)

**When all checked, you're ready to deploy! 🚀**
