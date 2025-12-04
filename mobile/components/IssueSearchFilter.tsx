import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { IssueStatus, IssuePriority, IssueFilters } from '@citizen-safety/shared';

interface IssueSearchFilterProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  categories?: string[];
}

export default function IssueSearchFilter({ filters, onFiltersChange, categories = [] }: IssueSearchFilterProps) {
  const { colors } = useTheme();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const statusOptions: { value: IssueStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const priorityOptions: { value: IssuePriority | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: colors.textSecondary },
    { value: 'critical', label: 'Critical', color: '#DC2626' },
    { value: 'high', label: 'High', color: '#F59E0B' },
    { value: 'medium', label: 'Medium', color: '#3B82F6' },
    { value: 'low', label: 'Low', color: '#10B981' },
  ];

  const handleSearchChange = (text: string) => {
    onFiltersChange({ ...filters, search: text || undefined });
  };

  const handleStatusChange = (status: IssueStatus | 'all') => {
    onFiltersChange({ ...filters, status: status === 'all' ? undefined : status });
  };

  const handlePriorityChange = (priority: IssuePriority | 'all') => {
    onFiltersChange({ ...filters, priority: priority === 'all' ? undefined : priority });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category: category === 'all' ? undefined : category });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(filters.status || filters.priority || filters.category || filters.search);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search issues..."
          placeholderTextColor={colors.textSecondary}
          value={filters.search || ''}
          onChangeText={handleSearchChange}
        />
        {filters.search && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            showFilterModal && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={18}
            color={showFilterModal ? '#FFFFFF' : colors.text}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: showFilterModal ? '#FFFFFF' : colors.text },
            ]}
          >
            Filters
          </Text>
          {hasActiveFilters && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>!</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Quick Status Filter */}
        {statusOptions.slice(1).map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pill,
              {
                backgroundColor: filters.status === option.value ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleStatusChange(option.value)}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: filters.status === option.value ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Status</Text>
                <View style={styles.optionsRow}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            (!filters.status && option.value === 'all') ||
                            filters.status === option.value
                              ? colors.primary
                              : colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleStatusChange(option.value)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          {
                            color:
                              (!filters.status && option.value === 'all') ||
                              filters.status === option.value
                                ? '#FFFFFF'
                                : colors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Priority</Text>
                <View style={styles.optionsRow}>
                  {priorityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            (!filters.priority && option.value === 'all') ||
                            filters.priority === option.value
                              ? option.value === 'all'
                                ? colors.primary
                                : option.color
                              : colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handlePriorityChange(option.value)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          {
                            color:
                              (!filters.priority && option.value === 'all') ||
                              filters.priority === option.value
                                ? '#FFFFFF'
                                : colors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Filter */}
              {categories.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Category</Text>
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: !filters.category ? colors.primary : colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleCategoryChange('all')}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: !filters.category ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor:
                              filters.category === category ? colors.primary : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => handleCategoryChange(category)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            {
                              color: filters.category === category ? '#FFFFFF' : colors.text,
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={clearFilters}
              >
                <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  pillsContainer: {
    marginTop: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

