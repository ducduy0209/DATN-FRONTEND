import { AdminLayout } from "@components/layouts/adminLayout"
import { API_ENDPOINT } from "@models/api"
import { useBoundStore } from "@zustand/total"
import React, { useEffect, useState } from "react"
import { Response } from "@models/api"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Image } from "@nextui-org/react"
import { CustomButton } from "@components/common/CustomButton"
import Icon from "@components/icons"
import { useRouter } from "next/router"
import RateStar from "@components/common/RateStar"
import { Link } from "@nextui-org/react"
import { ROLE_ACCOUNT } from "@models/user"
import { NOTIFICATION_TYPE, notify } from "@utils/notify"

type Analytics = {
  totalRevenue?: number
  totalBooks?: number
  totalUsers?: number
}

enum LANGUAGE {
  VI = "vi",
  EN = "en",
}

export type AnalyticsBook = {
  _id: string
  totalRevenue: number
  title: string
  cover_image: string
  slug: string
  languange: LANGUAGE
  amount_borrowed: number
  access_times: number
}

enum TIME {
  TODAY = "today",
  YESTERDAY = "yesterday",
  "3DAYSAGO" = "3-days-ago",
  "7DAYSAGO" = "7-days-ago",
  "14DAYSAGO" = "14-days-ago",
  "30DAYSAGO" = "30-days-ago",
}

const AdminHomeScreen = () => {
  const route = useRouter()
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: undefined,
    totalBooks: undefined,
    totalUsers: undefined,
  })
  const [time, setTime] = useState<TIME>(TIME.TODAY)
  const [topSellerBooks, setTopSellerBooks] = useState<AnalyticsBook[]>()
  const [topBadBooks, setTopBadBooks] = useState<AnalyticsBook[]>()

  const { authInfo } = useBoundStore((store) => ({
    authInfo: store.authInfo,
  }))

  const handleFetchAnalytics = async () => {
    const response = await fetch(API_ENDPOINT + `/analysts?time=${time}`, {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${authInfo.access?.token}`,
      },
    })
    const raw = (await response.json()) as Response<Analytics>
    if (raw.status === "success" && raw.data) {
      setAnalytics(raw.data)
    }
  }

  useEffect(() => {
    handleFetchAnalytics()
  }, [time])

  useEffect(() => {
    setInterval(handleFetchAnalytics, 10000)
  }, [])

  useEffect(() => {
    const handleFetchTopSellerBooks = async () => {
      const response = await fetch(API_ENDPOINT + `/analysts/top-seller-books`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authInfo.access?.token}`,
        },
      })
      const raw = (await response.json()) as Response<AnalyticsBook[]>
      if (raw.status === "success" && raw.data?.length) {
        setTopSellerBooks(raw.data)
      }
    }
    handleFetchTopSellerBooks()
  }, [])

  useEffect(() => {
    const handleFetchTopBadBooks = async () => {
      const response = await fetch(API_ENDPOINT + `/analysts/top-bad-books`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authInfo.access?.token}`,
        },
      })
      const raw = (await response.json()) as Response<AnalyticsBook[]>
      if (raw.status === "success" && raw.data?.length) {
        setTopBadBooks(raw.data)
      }
    }
    handleFetchTopBadBooks()
  }, [])

  return (
    <AdminLayout>
      <div className="px-20 py-8">
        <Dropdown>
          <DropdownTrigger>
            <CustomButton variant="bordered" className="uppercase" endContent={<Icon name="chevron-down" />}>
              {time.replaceAll("-", " ")}
            </CustomButton>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions" className="capitalize">
            {Object.values(TIME).map((item) => (
              <DropdownItem key={item} onClick={() => setTime(item)}>
                {item.replaceAll("-", " ")}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <div className="mt-4 flex justify-between gap-8">
          <div className="basis-1/3 rounded-lg bg-green-400 px-8 py-4 text-white">
            <p className="text-xl font-semibold">Tổng số sách đã bán</p>
            <p className="text-3xl font-semibold">{analytics.totalBooks}</p>
          </div>
          <div className="basis-1/3 rounded-lg bg-green-400 px-8 py-4 text-white">
            <p className="text-xl font-semibold">Tổng doanh thu</p>
            <p className="text-3xl font-semibold">${analytics.totalRevenue}</p>
          </div>
          <div className="basis-1/3 rounded-lg bg-green-400 px-8 py-4 text-white">
            <p className="text-xl font-semibold">Tổng số người dùng mới</p>
            <p className="text-3xl font-semibold">{analytics.totalUsers}</p>
          </div>
        </div>
        <div className="flex w-full justify-between gap-8">
          <div className="mt-4 flex basis-1/2 justify-between gap-4">
            <div className="w-full rounded-lg bg-teal-400 px-8 py-6 text-white">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xl font-semibold">Top 10 Sách Bán Chạy</p>
                <Link href="/admin/top-seller-books" className="text-white">
                  Xem tất cả
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {topSellerBooks?.length &&
                  topSellerBooks.slice(0, 2).map((book) => (
                    <div
                      key={book.title}
                      className="flex h-[180px] w-full cursor-pointer gap-4 rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
                      onClick={() => route.push(`/book/${book.slug}`)}
                    >
                      <div className="flex basis-1/3 justify-center">
                        <Image
                          src={`http://localhost:3000/img/books/${book.cover_image}`}
                          alt={book.title}
                          className="mx-auto h-[140px]"
                        />
                      </div>
                      <div className="flex basis-2/3 flex-col gap-2">
                        <p className="line-clamp-2 text-black">{book.title}</p>
                        <p className="text-black">Số lượt xem: {book.access_times}</p>
                        <p className="text-black">Số lượt mua: {book.amount_borrowed}</p>
                        <p className="text-black">Doanh thu: ${book.totalRevenue}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex basis-1/2 justify-between gap-4">
            <div className="w-full rounded-lg bg-teal-400 px-8 py-6 text-white">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xl font-semibold">Top 10 Sách Bán Chậm</p>
                <Link href="/admin/top-bad-seller-books" className="text-white">
                  Xem tất cả
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {topBadBooks?.length &&
                  topBadBooks.slice(0, 2).map((book) => (
                    <div
                      key={book.title}
                      className="flex h-[180px] w-full cursor-pointer gap-4 rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
                      onClick={() => route.push(`/book/${book.slug}`)}
                    >
                      <div className="flex basis-1/3 justify-center">
                        <Image
                          src={`http://localhost:3000/img/books/${book.cover_image}`}
                          alt={book.title}
                          className="mx-auto h-[140px]"
                        />
                      </div>
                      <div className="flex basis-2/3 flex-col gap-2">
                        <p className="line-clamp-2 text-black">{book.title}</p>
                        <p className="text-black">Số lượt xem: {book.access_times}</p>
                        <p className="text-black">Số lượt mua: {book.amount_borrowed}</p>
                        <p className="text-black">Doanh thu: ${book.totalRevenue}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminHomeScreen
