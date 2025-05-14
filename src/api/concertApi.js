import axios from "axios";

const host = "http://localhost:8089/concert";

export const getList = async (pageRequest, category) => {
  const res = await axios.get(`${host}/list/${category}`, {
    params: pageRequest,
  });
  return res.data;
};

export const getConcertByCno = async (cno) => {
  const res = await axios.get(`${host}/read/${cno}`);
  return res.data;
};

export const getConcertByCnoAndDate = async (cno, scheduleDate) => {
  const res = await axios.get(`${host}/reservation`, {
    params: {
      cno: cno,
      startTime: scheduleDate,
    },
  });
  return res.data;
};
