import { ButtonGroup, Flex, IconButton, Pagination } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

type StandardPaginationProps = {
  totalPages: number;
  itemCount: number;
  pageSize: number;
  currentPage: number;
  onChange: (value: number) => void;
};

function StandardPagination({
  totalPages,
  itemCount,
  pageSize,
  currentPage,
  onChange,
}: StandardPaginationProps) {
  if (totalPages < 2) {
    return null;
  }

  return (
    <Flex justifyContent="center">
      <Pagination.Root
        count={itemCount}
        pageSize={pageSize}
        page={currentPage}
        onPageChange={e => onChange(e.page)}
      >
        <ButtonGroup variant="ghost" size="sm">
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={page => (
              <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton>
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </Flex>
  );
}

export default StandardPagination;
