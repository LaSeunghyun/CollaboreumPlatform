import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCreationForm } from '@/features/events/components/EventCreationForm';
import { EventList } from '@/features/events/components/EventList';
import { MyEventsList } from '@/features/events/components/MyEventsList';
import { useEventCreationForm } from '@/features/events/hooks/useEventCreationForm';
import { useEventFilters } from '@/features/events/hooks/useEventFilters';
import { useMyEvents } from '@/features/events/hooks/useMyEvents';

const EventManagementPage: React.FC = () => {
  const {
    formData,
    errors,
    loading,
    categories,
    loadingCategories,
    handleInputChange,
    handleSubmit,
  } = useEventCreationForm({
    onSuccess: () => {
      window.alert('이벤트가 성공적으로 생성되었습니다!');
      refreshEvents();
      refreshMyEvents();
    },
    onError: () => {
      window.alert('이벤트 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const {
    filteredEvents,
    loading: listLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories: filterCategories,
    refreshEvents,
  } = useEventFilters();

  const {
    myEvents,
    loading: myEventsLoading,
    refresh: refreshMyEvents,
  } = useMyEvents();

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>이벤트 관리</h1>
        <p className='text-gray-600'>다양한 이벤트를 생성하고 참가하세요</p>
      </div>

      <Tabs defaultValue='list' className='w-full'>
        <TabsList className='grid w-full grid-cols-1 md:grid-cols-3'>
          <TabsTrigger value='list'>이벤트 목록</TabsTrigger>
          <TabsTrigger value='create'>이벤트 생성</TabsTrigger>
          <TabsTrigger value='my-events'>내 이벤트</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='mt-6'>
          <EventList
            events={filteredEvents}
            loading={listLoading}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={filterCategories}
          />
        </TabsContent>

        <TabsContent value='create' className='mt-6'>
          <EventCreationForm
            formData={formData}
            errors={errors}
            categories={categories}
            loading={loading}
            loadingCategories={loadingCategories}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </TabsContent>

        <TabsContent value='my-events' className='mt-6'>
          <MyEventsList
            events={myEvents}
            loading={myEventsLoading}
            onRefresh={refreshMyEvents}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventManagementPage;
