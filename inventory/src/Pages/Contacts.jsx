import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaMapMarkerAlt } from "react-icons/fa";
import Header from "../Components/Header";
import HeroImage from "../assets/zhiyuan.jpg"

const Contacts = () => {
  return (
    <>
      <Box sx={{ minHeight: "100vh", position: "relative" }}>
        <Header />

        {/* Background Image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${HeroImage})`, // Replace with your image URL
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0, // Place below the content
            opacity: 0.7, // Slight transparency for better readability
          }}
        />

        {/* Main Content Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            px: { xs: 2, md: 10 },
            gap: 5,
            position: "relative", // Ensure content stays above the background
            zIndex: 1, // Place above the background
          }}
        >
          {/* Google Map Section */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "80%" },
              height: "450px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d965.4546579392137!2d121.05222020401362!3d14.552361944060047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c907d9601225%3A0x8495ad7d16ee750c!2sAlveo%20Park%20Triangle%20Tower!5e0!3m2!1sen!2sph!4v1738195701836!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </Box>

          {/* Contact Information Section */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "50%" },
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 2,
              color: "#000", // Black text for readability
              backgroundColor: "rgba(255, 255, 255, 0.8)", // White background with transparency
              padding: 3,
              borderRadius: 2, // Rounded corners
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", // Add shadow
            }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              ZHIYUAN ENTERPRISE GROUP INC.
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 3,
              }}
            >
              CONTACT US
            </Typography>

            {/* Phone Information */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textAlign: "left",
                width: "100%",
              }}
            >
              <FaPhoneAlt size={20} />
              <Typography variant="body1">642-5310 <br /> 09192134577</Typography>
            </Box>

            {/* Email Information */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textAlign: "left",
                width: "100%",
              }}
            >
              <FaEnvelope size={20} />
              <Typography variant="body1">ZhiyuanEnterprise@gmail.com</Typography>
            </Box>

            {/* Office Address */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textAlign: "left",
                width: "100%",
              }}
            >
              <FaMapMarkerAlt size={20} />
              <Typography variant="body1">
                32nd Street corner 11th Avenue, Bonifacio Global City, Taguig
              </Typography>
            </Box>

            {/* Social Media Information */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textAlign: "left",
                width: "100%",
              }}
            >
              <FaFacebookF size={20} />
              <Link
                href="https://www.facebook.com/zhiyuanenterprisegroupinc/"
                target="_blank"
                rel="noopener"
                sx={{
                  textDecoration: "none",
                  color: "#000",
                  "&:hover": {
                    color: "#555",
                  },
                }}
              >
                Zhiyuan Enterprise Group Inc.
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Contacts;
