import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { adminService, User, Role } from '../services/admin.service';

interface UserEditModalProps {
  user: User | null;
  roles: Role[];
  visible: boolean;
  onClose: () => void;
  onSave: (userId: string, roleName: string) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, roles, visible, onClose, onSave }) => {
  const [selectedRole, setSelectedRole] = useState(user?.roles?.[0] ?? roles?.[0]?.name ?? '');

  useEffect(() => {
    setSelectedRole(user?.roles?.[0] ?? roles?.[0]?.name ?? '');
  }, [user, roles]);

  const handleSave = () => {
    if (user && selectedRole) {
      onSave(user.userID, selectedRole);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit User Role</Text>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Name: {user?.personName}</Text>
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Email: {user?.email}</Text>
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Role:</Text>
            <Picker
              selectedValue={selectedRole}
              onValueChange={setSelectedRole}
              style={styles.picker}
            >
              {roles.map(role => (
                <Picker.Item key={role.roleID} label={role.name} value={role.name} />
              ))}
            </Picker>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function UserManagementScreen({ navigation }: any) {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigation.replace('UserDashboard');
      return;
    }
    loadUsers();
    loadRoles();
  }, [isAdmin, navigation, currentPage, searchText, selectedRoleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getUsers(
        currentPage,
        20,
        searchText || undefined,
        selectedRoleFilter || undefined
      );

      // Fetch roles for each user on the page (N+1, but only per page)
      const enriched = await Promise.all(
        (response.data ?? []).map(async (u) => {
          try {
            const detail = await adminService.getUserById(u.userID);
            return { ...u, roles: detail.user.roles ?? [] };
          } catch {
            return u;
          }
        })
      );

      setUsers(enriched);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await adminService.getAllRoles();
      setRoles(response.roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadUsers();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRoleFilter(role);
    setCurrentPage(1);
  };

  const editUser = async (user: User) => {
    try {
      if (!roles.length) await loadRoles();
      const detail = await adminService.getUserById(user.userID);
      setEditingUser(detail.user);
      setModalVisible(true);
    } catch (e) {
      console.error('Error loading user details:', e);
      Alert.alert('Error', 'Failed to load user details');
    }
  };

  const saveUserRole = async (userId: string, roleName: string) => {
    try {
      await adminService.updateUserRole(userId, roleName);
      Alert.alert('Success', 'User role updated successfully');
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await adminService.toggleUserStatus(user.userID);
      Alert.alert('Success', `User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.personName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.userRole}>{(user.roles ?? []).join(', ')}</Text>
          <Text style={[styles.userStatus, user.isActive ? styles.activeStatus : styles.inactiveStatus]}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Text style={styles.userDate}>
          Created: {new Date((user.createdDate ?? user.createdAt) as any).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => editUser(user)}>
          <Ionicons name="create" size={20} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, user.isActive ? styles.deactivateButton : styles.activateButton]} 
          onPress={() => toggleUserStatus(user)}
        >
          <Ionicons 
            name={user.isActive ? "close-circle" : "checkmark-circle"} 
            size={20} 
            color={user.isActive ? "#ff4444" : "#44ff44"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchText}
          onChangeText={handleSearch}
        />
        <Picker
          selectedValue={selectedRoleFilter}
          onValueChange={handleRoleFilter}
          style={styles.rolePicker}
        >
          <Picker.Item label="All Roles" value="" />
          {roles.map(role => (
            <Picker.Item key={role.roleID} label={role.name} value={role.name} />
          ))}
        </Picker>
      </View>

      {/* Users List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.userID}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <Text style={styles.pageButtonText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit User Modal */}
      <UserEditModal
        user={editingUser}
        roles={roles}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveUserRole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  rolePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersList: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userRole: {
    fontSize: 12,
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  userStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  inactiveStatus: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  deactivateButton: {
    backgroundColor: '#ffebee',
  },
  activateButton: {
    backgroundColor: '#e8f5e8',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pageButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
  },
});