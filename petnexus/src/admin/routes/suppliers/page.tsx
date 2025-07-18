import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings, Plus } from "@medusajs/icons"
import { Container, Heading, Button, Badge, Text, Table } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

type SuppliersResponse = {
  suppliers: {
    id: string
    company_name: string
    contact_person: string
    email: string
    phone: string
    status: string
    created_at: string
  }[]
  count: number
  page: number
  limit: number
}

const SuppliersPage = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)
  const limit = 15
  const offset = useMemo(() => {
    return currentPage * limit
  }, [currentPage])

  const { data, isLoading } = useQuery<SuppliersResponse>({
    queryFn: () => sdk.client.fetch(`/admin/suppliers`, {
      query: {
        limit,
        offset,
      },
    }),
    queryKey: [["suppliers", limit, offset]],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green"
      case "inactive":
        return "red"
      case "suspended":
        return "orange"
      default:
        return "grey"
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Suppliers</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage your product suppliers and restock orders
          </Text>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={() => navigate("/suppliers/new")}
        >
          <Plus />
          Add Supplier
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <Text>Loading suppliers...</Text>
          </div>
        ) : (
          <>
            {data?.suppliers && data.suppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Company Name</Table.HeaderCell>
                      <Table.HeaderCell>Email</Table.HeaderCell>
                      <Table.HeaderCell>Phone</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Created</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.suppliers.map((supplier) => (
                      <Table.Row key={supplier.id}>
                        <Table.Cell>
                          <div>
                            <Text size="small" weight="plus">{supplier.company_name}</Text>
                            {supplier.contact_person && (
                              <Text size="small" className="text-ui-fg-subtle">{supplier.contact_person}</Text>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">{supplier.email}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">{supplier.phone || "-"}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={getStatusColor(supplier.status)}>
                            {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small">
                            {new Date(supplier.created_at).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => navigate(`/suppliers/${supplier.id}`)}
                          >
                            View
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>

                {/* Pagination */}
                {data && data.count > limit && (
                  <div className="flex justify-between items-center mt-6">
                    <Text size="small" className="text-ui-fg-subtle">
                      Showing {offset + 1} to {Math.min(offset + limit, data.count)} of {data.count} suppliers
                    </Text>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={offset + limit >= data.count}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Buildings className="mx-auto mb-4 text-ui-fg-subtle" />
                <Text size="small" className="text-ui-fg-subtle">
                  No suppliers found. Create your first supplier to get started.
                </Text>
                <Button 
                  variant="secondary" 
                  size="small" 
                  className="mt-4"
                  onClick={() => navigate("/suppliers/new")}
                >
                  <Plus className="mr-2" />
                  Add First Supplier
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Suppliers",
  icon: Buildings,
})

export default SuppliersPage 