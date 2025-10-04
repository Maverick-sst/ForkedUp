async function getFormattedAddress(lat, lng) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C+${lng}&key=${process.env.OPENCAGE_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted;
    } else {
      return;
    }
  } catch (err) {
    return;
  }
}

module.exports =getFormattedAddress;