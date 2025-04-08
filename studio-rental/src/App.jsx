// Main component for the rental calculator and admin interface
import { useState, useEffect } from "react";
import {
  CalendarDays,
  Home,
  CalendarCheck,
} from "lucide-react";

const roomTypes = {
  oneRoom: {
    label: "원룸",
    baseRate: 150000,
    maintenance: 50000,
    extraNight: 40000,
  },
  ownerUnit: {
    label: "주인세대",
    baseRate: 500000,
    maintenance: 100000,
    extraNight: 100000,
  },
  twoRoom: {
    label: "투룸",
    baseRate: 250000,
    maintenance: 70000,
    extraNight: 60000,
  },
};

const discounts = [
  { weeks: 6, rate: 0.25 },
  { weeks: 5, rate: 0.2 },
  { weeks: 4, rate: 0.15 },
  { weeks: 3, rate: 0.1 },
  { weeks: 2, rate: 0.05 },
];

function getTotalNights(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
  return Math.max(0, diff);
}

function getWeeksAndDays(nights) {
  const weeks = Math.floor(nights / 7);
  const days = nights % 7;
  return { weeks, days };
}

export default function RentalCalculator() {
  const [roomType, setRoomType] = useState("oneRoom");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    setToday(now.toISOString().split("T")[0]);
  }, []);

  const calculate = () => {
    const { baseRate, maintenance, extraNight } = roomTypes[roomType];
    const nights = getTotalNights(checkIn, checkOut);
    const { weeks, days } = getWeeksAndDays(nights);

    let finalWeeks = weeks;
    let extraCost = 0;
    let extraNote = "";
    let calculationDetail = "";

    if (days >= 4) {
      finalWeeks += 1;
      extraNote = `※ ${weeks}주 ${days}일 → ${finalWeeks}주 요금 적용`;
      calculationDetail = `(${baseRate} × ${finalWeeks}주 할인 적용) + 관리비(${maintenance} × ${finalWeeks}주) + 청소비 50,000원`;
    } else {
      extraCost = days * extraNight;
      extraNote = `※ ${weeks}주 ${days}일 → 주 요금 + 추가 숙박요금 적용`;
      calculationDetail = `(${baseRate} × ${weeks}주 할인 적용) + 추가숙박 (${extraNight} × ${days}일) + 관리비(${maintenance} × ${weeks}주) + 청소비 50,000원`;
    }

    const discount = discounts.find((d) => finalWeeks >= d.weeks)?.rate || 0;
    const discountedRate = baseRate * (1 - discount);
    const stayCost = discountedRate * finalWeeks + extraCost;
    const maintenanceCost = maintenance * finalWeeks;
    const cleaningFee = 50000;
    const deposit = 330000;
    const total = stayCost + maintenanceCost + cleaningFee;

    return {
      stayCost,
      maintenanceCost,
      cleaningFee,
      total,
      deposit,
      weeks,
      days,
      extraNote,
      calculationDetail,
      discount,
    };
  };

  const result = checkIn && checkOut ? calculate() : null;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>단기임대 요금 계산기</h2>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <Home size={20} style={{ marginRight: 8 }} /> 방 타입:
        </label>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          style={{ width: "100%", padding: 16, fontSize: 18 }}
        >
          {Object.entries(roomTypes).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <CalendarDays size={20} style={{ marginRight: 8 }} /> 입실 날짜:
        </label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          min={today}
          style={{ width: "100%", padding: 16, fontSize: 18 }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <CalendarCheck size={20} style={{ marginRight: 8 }} /> 퇴실 날짜:
        </label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={checkIn || today}
          style={{ width: "100%", padding: 16, fontSize: 18 }}
        />
      </div>

      {result && (
        <div style={{ marginBottom: 24, fontSize: 18 }}>
          <p>
            계약 기간: <strong>{result.weeks}주 {result.days}일</strong>
          </p>
          <p style={{ color: "#888" }}>{result.extraNote}</p>
          {result.discount > 0 && (
            <p style={{ color: "#888" }}>
              ※ 할인 적용: {Math.round(result.discount * 100)}%
            </p>
          )}
          <p style={{ color: "#aaa", fontSize: 16, marginTop: 8 }}>{result.calculationDetail}</p>
        </div>
      )}

      <hr />

      {result && (
        <div style={{ fontSize: 18, lineHeight: 1.8 }}>
          <p>숙박비: {result.stayCost.toLocaleString()}원</p>
          <p>관리비: {result.maintenanceCost.toLocaleString()}원</p>
          <p>퇴실 청소비: {result.cleaningFee.toLocaleString()}원</p>
          <p>
            <strong>총 합계 (보증금 제외): {result.total.toLocaleString()}원</strong>
          </p>
          <p>보증금: {result.deposit.toLocaleString()}원 (퇴실 시 환불)</p>
        </div>
      )}
    </div>
  );
}