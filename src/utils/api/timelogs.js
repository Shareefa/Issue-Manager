export const createTimeLog = async requestObj => {
  const response = await fetch("/log", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestObj),
  });

  return await response;
};

export const getTimeLogs = sprintId => {
  return fetch(`/log/${sprintId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(response => {
    return response.json();
  });
};

export const getTimeSpentLogs = sprintId => {
  return fetch(`/log/${sprintId}?type=time_spent`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(response => {
    return response.json();
  });
};

export const getTimeRemainingLogs = sprintId => {
  return fetch(`/log/${sprintId}?type=time_remaining`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(response => {
    return response.json();
  });
};

export const deleteTimeLog = id => {
  return fetch(`/timelog/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(response => {
    return response.json();
  });
};
