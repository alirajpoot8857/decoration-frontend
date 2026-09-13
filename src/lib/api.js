const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lumiere_token');
    }
    return null;
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  buildQueryString(params = {}) {
    if (!params || typeof params !== 'object') return '';
    const clean = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
        clean[key] = val;
      }
    });
    const query = new URLSearchParams(clean).toString();
    return query ? `?${query}` : '';
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.isMultipart);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Users (Admin)
  getUsers(params = {}) {
    return this.request(`/users${this.buildQueryString(params)}`);
  }

  updateUserRole(id, role) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  deleteUser(id) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Services
  getServices(params = {}) {
    return this.request(`/services${this.buildQueryString(params)}`);
  }

  createService(data) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateService(id, data) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteService(id) {
    return this.request(`/services/${id}`, { method: 'DELETE' });
  }

  // Packages
  getPackages(params = {}) {
    return this.request(`/packages${this.buildQueryString(params)}`);
  }

  createPackage(data) {
    return this.request('/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePackage(id, data) {
    return this.request(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deletePackage(id) {
    return this.request(`/packages/${id}`, { method: 'DELETE' });
  }

  // Bookings & Gallery Orders
  getBookings(params = {}) {
    return this.request(`/bookings${this.buildQueryString(params)}`);
  }

  getBooking(id) {
    return this.request(`/bookings/${id}`);
  }

  createBooking(data) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateBookingStatus(id, data) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Gallery
  getGallery(params = {}) {
    return this.request(`/gallery${this.buildQueryString(params)}`);
  }

  createGalleryImage(data) {
    return this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateGalleryImage(id, data) {
    return this.request(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteGalleryImage(id) {
    return this.request(`/gallery/${id}`, { method: 'DELETE' });
  }

  // Rentals
  getRentalItems(params = {}) {
    return this.request(`/rentals/items${this.buildQueryString(params)}`);
  }

  getRentalSummary(params = {}) {
    return this.request(`/rentals/summary${this.buildQueryString(params)}`);
  }

  createRentalItem(data) {
    return this.request('/rentals/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateRentalItem(id, data) {
    return this.request(`/rentals/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteRentalItem(id) {
    return this.request(`/rentals/items/${id}`, { method: 'DELETE' });
  }

  checkRentalAvailability(data) {
    return this.request('/rentals/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  submitRentalRequest(data) {
    return this.request('/rentals/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getRentalRequests(params = {}) {
    return this.request(`/rentals/requests${this.buildQueryString(params)}`);
  }

  updateRentalRequestStatus(id, data) {
    return this.request(`/rentals/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteRentalRequest(id) {
    return this.request(`/rentals/requests/${id}`, { method: 'DELETE' });
  }

  // Inventory
  getInventory(params = {}) {
    return this.request(`/inventory${this.buildQueryString(params)}`);
  }

  createInventoryItem(data) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateInventoryItem(id, data) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteInventoryItem(id) {
    return this.request(`/inventory/${id}`, { method: 'DELETE' });
  }

  adjustInventoryStock(id, data) {
    return this.request(`/inventory/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sales
  getSales(params = {}) {
    return this.request(`/sales${this.buildQueryString(params)}`);
  }

  getUnifiedSales(params = {}) {
    return this.request(`/sales/unified${this.buildQueryString(params)}`);
  }

  createSale(data) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateSaleStatus(id, data) {
    return this.request(`/sales/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteSale(id) {
    return this.request(`/sales/${id}`, { method: 'DELETE' });
  }

  // Purchases
  getPurchases(params = {}) {
    return this.request(`/purchases${this.buildQueryString(params)}`);
  }

  createPurchase(data) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePurchaseStatus(id, data) {
    return this.request(`/purchases/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deletePurchase(id) {
    return this.request(`/purchases/${id}`, { method: 'DELETE' });
  }

  // Events
  getEvents(params = {}) {
    return this.request(`/events${this.buildQueryString(params)}`);
  }

  createEvent(data) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateEvent(id, data) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteEvent(id) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  }

  // Customers
  getCustomers(params = {}) {
    return this.request(`/customers${this.buildQueryString(params)}`);
  }

  getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateCustomer(id, data) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteCustomer(id) {
    return this.request(`/customers/${id}`, { method: 'DELETE' });
  }

  // Testimonials
  getTestimonials(params = {}) {
    return this.request(`/testimonials${this.buildQueryString(params)}`);
  }

  createTestimonial(data) {
    return this.request('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  deleteTestimonial(id) {
    return this.request(`/testimonials/${id}`, { method: 'DELETE' });
  }

  // Contact Inquiries
  submitInquiry(data) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getInquiries(params = {}) {
    return this.request(`/contact${this.buildQueryString(params)}`);
  }

  updateInquiryStatus(id, data) {
    return this.request(`/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteInquiry(id) {
    return this.request(`/contact/${id}`, { method: 'DELETE' });
  }

  // Activity Logs
  getActivityLogs(params = {}) {
    return this.request(`/activity-logs${this.buildQueryString(params)}`);
  }

  // Dashboard
  getDashboardOverview() {
    return this.request('/dashboard/overview');
  }

  // Settings
  getSettings() {
    return this.request('/settings');
  }

  updateSetting(key, data) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  bulkUpdateSettings(settings) {
    return this.request('/settings/bulk', {
      method: 'POST',
      body: JSON.stringify({ settings }),
    });
  }

  updateSettings(settings) {
    return this.bulkUpdateSettings(settings);
  }

  sendTestNotificationEmail(email = null) {
    return this.request('/settings/test-email', {
      method: 'POST',
      body: JSON.stringify({ email: email || undefined }),
    });
  }

  // Upload
  uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/upload/image', {
      method: 'POST',
      body: formData,
      isMultipart: true,
    });
  }
}

export const api = new ApiService();
export default api;
