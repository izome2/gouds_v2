import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import logoDark from "@/assets/img/logo/logo-color.png";

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
  ],
});
Font.register({
  family: "DejaVu Sans",
  fonts: [
    {
      src: "https://kendo.cdn.telerik.com/2017.2.621/styles/fonts/DejaVu/DejaVuSans.ttf",
    },
    {
      src: "https://kendo.cdn.telerik.com/2017.2.621/styles/fonts/DejaVu/DejaVuSans-Bold.ttf",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    marginRight: 10,
    marginBottom: 20,
    marginLeft: 10,
    paddingTop: 30,
    paddingLeft: 10,
    paddingRight: 29,
    lineHeight: 1.5,
  },
  table: {
    display: "table",
    width: "auto",
    color: "#4b5563",
    marginRight: 10,
    marginBottom: 20,
    marginLeft: 10,
    marginTop: 0,
    borderRadius: "8px",
    borderColor: "#e9e9e9",
    borderStyle: "solid",
    borderWidth: 0.5,
    padding: 0,
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    paddingBottom: 2,
    paddingTop: 2,
    textAlign: "left",
    borderWidth: 0.8,
    borderColor: "#E5E7EB",
    borderBottom: "0",
  },
  tableRowHeder: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 0,
    borderBottomWidth: 0.8,
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    textTransform: "uppercase",
    textAlign: "left",
  },
  tableCol: {
    width: "25%",
    textAlign: "left",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
    paddingLeft: "0",
    paddingRight: "0",
    marginLeft: "13",
    marginRight: "13",
  },
  tableCellQuantity: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
    textAlign: "center",
    paddingLeft: "0",
    paddingRight: "0",
    marginLeft: "12",
    marginRight: "12",
  },
  invoiceFirst: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 18,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottom: 1,
    borderColor: "#f3f4f6",
  },
  invoiceSecond: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 12,
    marginLeft: "13",
    marginRight: "13",
  },
  // ✅ New style for delivery section
  deliverySection: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: "13",
    marginRight: "13",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    marginTop: 10,
  },
  deliveryHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "Open Sans",
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  deliveryLabel: {
    fontSize: 9,
    color: "#64748b",
    width: "30%",
    fontFamily: "Open Sans",
  },
  deliveryValue: {
    fontSize: 9,
    color: "#1e293b",
    width: "70%",
    fontFamily: "Open Sans",
    fontWeight: "bold",
  },
  deliveryNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
  },
  deliveryNotesText: {
    fontSize: 8,
    color: "#475569",
    fontFamily: "Open Sans",
    lineHeight: 1.4,
  },
  invoiceThird: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderTop: 1,
    borderColor: "#ffffff",
    backgroundColor: "#f4f5f7",
    borderRadius: 12,
    marginLeft: "13",
    marginRight: "13",
  },
  logo: {
    width: 64,
    height: 25,
    bottom: 5,
    right: 10,
    marginBottom: 10,
    textAlign: "right",
    color: "#4b5563",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 10.3,
    marginRight: "39%",
    textTransform: "uppercase",
  },
  title: {
    color: "#2f3032",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 8.1,
    textTransform: "uppercase",
  },
  info: {
    fontSize: 9,
    color: "#6b7280",
  },
  infoCost: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: "4%",
    marginTop: "7px",
    textAlign: "left",
    width: "25%",
  },
  invoiceNum: {
    fontSize: 9,
    color: "#6b7280",
    marginLeft: "6%",
  },
  topAddress: {
    fontSize: 10,
    color: "#6b7280",
    width: "100%",
    marginRight: "62%",
    textAlign: "right",
    whiteSapce: "nowrap",
  },
  amount: {
    fontSize: 10,
    color: "#ef4444",
  },
  totalAmount: {
    fontSize: 10,
    color: "#ef4444",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "right",
  },
  status: {
    color: "#10b981",
  },
  quantity: {
    color: "#1f2937",
    textAlign: "center",
  },
  itemPrice: {
    color: "#1f2937",
    textAlign: "left",
  },
  header: {
    color: "#6b7280",
    fontSize: 9,
    fontFamily: "Open Sans",
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "left",
  },
  thanks: {
    color: "#22c55e",
  },
  infoRight: {
    textAlign: "right",
    fontSize: 9,
    color: "#6b7280",
    width: "25%",
    marginRight: "39%",
    fontFamily: "Open Sans",
  },
  titleRight: {
    textAlign: "right",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    fontSize: 8.1,
    width: "25%",
    marginRight: "39%",
    textTransform: "uppercase",
    color: "#2f3032",
  },
  topBg: {},
  invoiceDiv: {
    alignItems: "baseline",
  },
});

const InvoiceForDownload = ({
  data,
  currency,
  globalSetting,
  showDateFormat,
  getNumberTwo,
  deliveryInfo, // ✅ Add deliveryInfo prop
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.invoiceFirst}>
            <View style={styles.invoiceDiv}>
              <Text
                style={{
                  fontFamily: "Open Sans",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  alignItems: "baseline",
                }}
              >
                {t("invoice")}
              </Text>
              <Text style={styles.info}>
                Status :{" "}
                {data?.status === "Merged" && (
                  <Text style={{ color: "#eab308" }}>{data?.status}</Text>
                )}
                {data?.status === "Pending" && (
                  <Text style={{ color: "#eab308" }}>{data?.status}</Text>
                )}
                {data?.status === "Processing" && (
                  <Text style={{ color: "#14b8a6" }}>{data?.status}</Text>
                )}
                {data?.status === "POS-Completed" && (
                  <Text style={{ color: "#14b8a6" }}>{data?.status}</Text>
                )}
                {data?.status === "Fully Returned" && (
                  <Text style={{ color: "#14b8a6" }}>{data?.status}</Text>
                )}
                {data?.status === "Partial Returned" && (
                  <Text style={{ color: "#14b8a6" }}>{data?.status}</Text>
                )}
                {data?.status === "Delivered" && (
                  <Text style={{ color: "#22c55e" }}>{data?.status}</Text>
                )}
                {data?.status === "Cancel" && (
                  <Text style={{ color: "#f43f5e" }}>{data?.status}</Text>
                )}
                {data?.status === "Deleted" && (
                  <Text style={{ color: "#f43f5e" }}>{data?.status}</Text>
                )}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  flexDirection: "row",
                  marginLeft: 80,
                  marginTop: 35,
                  textAlign: "right",
                }}
              >
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  color: "#888",
                  marginTop: 2,
                  textAlign: "right",
                }}
              >
                {globalSetting?.address}
                {"\n"}
                {globalSetting?.contact}
                {"\n"}
                {globalSetting?.email}
                {"\n"}
                {globalSetting?.website}
              </Text>
            </View>
          </View>

          <View style={styles.invoiceSecond}>
            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={[styles.title, { fontSize: 10 }]}>{t("date")}</Text>
              <Text
                style={{
                  fontSize: 9,
                  color: "#6b7280",
                  textAlign: "left",
                }}
              >
                {data?.createdAt !== undefined && (
                  <Text>{showDateFormat(data?.createdAt)}</Text>
                )}
              </Text>
            </View>
            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={styles.title}>
                <Text
                  style={{ width: "25%", alignItems: "baseline", fontSize: 10 }}
                >
                  {t("InvoiceNo")}
                </Text>
              </Text>
              <Text style={styles.title}>
                <Text style={{ textAlign: "left" }}>
                  <Text
                    style={{
                      fontSize: 9,
                      color: "#6b7280",
                      marginLeft: "4%",
                      marginTop: "7px",
                      textAlign: "left",
                    }}
                  >
                    #{data?.invoice}
                  </Text>
                </Text>
              </Text>
            </View>

            <View
              style={{ width: "25%", alignItems: "baseline", float: "right" }}
            >
              <Text style={styles.title}>
                <Text
                  style={{
                    fontSize: 10,
                    float: "right",
                    textAlign: "right",
                    alignItems: "baseline",
                  }}
                >
                  {t("InvoiceTo")}
                </Text>
              </Text>
              <Text style={styles.title}>
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 9,
                    textTransform: "lowercase",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: "#6b7280",
                      marginTop: "7px",
                      textAlign: "right",
                      textTransform: "lowercase",
                    }}
                  >
                    {data?.user_info?.name}
                    {"\n"}
                    {data?.user_info?.contact}
                    {"\n"}
                    {data?.user_info?.email}
                    {"\n"}
                    {data?.user_info?.address?.substring(0, 30)}
                    {"\n"}
                    {data?.user_info?.city}, {data?.user_info?.country},{" "}
                    {data?.user_info?.zipCode}
                  </Text>
                </Text>
              </Text>
            </View>
          </View>

          {/* ✅ Add Delivery Information Section to PDF */}
          {deliveryInfo && (
            <View style={styles.deliverySection}>
              <Text style={styles.deliveryHeader}>🚚 Delivery Information</Text>

              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Type:</Text>
                <Text style={styles.deliveryValue}>{deliveryInfo.typeLabel}</Text>
              </View>

              {deliveryInfo.preferredDate && (
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryLabel}>Scheduled Date:</Text>
                  <Text style={styles.deliveryValue}>{deliveryInfo.preferredDateFormatted}</Text>
                </View>
              )}

              {deliveryInfo.estimatedDate && !deliveryInfo.preferredDate && (
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryLabel}>Estimated Date:</Text>
                  <Text style={styles.deliveryValue}>{deliveryInfo.estimatedDateFormatted}</Text>
                </View>
              )}

              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Time Slot:</Text>
                <Text style={styles.deliveryValue}>{deliveryInfo.timeSlotLabel}</Text>
              </View>

              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Status:</Text>
                <Text style={styles.deliveryValue}>{deliveryInfo.statusLabel}</Text>
              </View>

              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Address:</Text>
                <Text style={styles.deliveryValue}>
                  {data?.user_info?.address}, {data?.user_info?.city}
                </Text>
              </View>

              {deliveryInfo.notes && (
                <View style={styles.deliveryNotes}>
                  <Text style={styles.deliveryLabel}>Delivery Notes:</Text>
                  <Text style={styles.deliveryNotesText}>{deliveryInfo.notes}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.table}>
            <View style={styles.tableRowHeder}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 9,
                      fontFamily: "Open Sans",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "left",
                    }}
                  >
                    Product Title
                  </Text>
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 9,
                      fontFamily: "Open Sans",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    {t("Quantity")}
                  </Text>
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 9,
                      fontFamily: "Open Sans",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "left",
                    }}
                  >
                    {t("ItemPrice")}
                  </Text>
                </Text>
              </View>

              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 9,
                      fontFamily: "Open Sans",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "right",
                    }}
                  >
                    {t("Amount")}
                  </Text>
                </Text>
              </View>
            </View>
            {data?.cart?.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.title?.substring(0, 20)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellQuantity}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        textAlign: "center",
                        alignItems: "center",
                        fontFamily: "Open Sans",
                      }}
                    >
                      {item.quantity}
                    </Text>
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        textAlign: "left",
                        fontFamily: "Open Sans",
                      }}
                    >
                      {getNumberTwo(item.price)}
                      {currency}
                    </Text>
                  </Text>
                </View>

                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#ef4444",
                        fontWeight: "bold",
                        textAlign: "right",
                        fontFamily: "Open Sans",
                      }}
                    >
                      {getNumberTwo(item.price * item.quantity)}
                      {currency}
                    </Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.invoiceThird}>
            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={styles.title}>{t("InvoicepaymentMethod")}</Text>
              <Text style={{ fontSize: 10, color: "#0e9f6e" }}>
                {data?.paymentMethod}
              </Text>
            </View>
            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={styles.title}>
                <Text style={{ width: "25%", alignItems: "baseline" }}>
                  Sub Total
                </Text>
              </Text>
              <Text style={styles.title}>
                <Text style={{ textAlign: "left" }}>
                  <Text style={styles.infoCost}>
                    {getNumberTwo(data?.subTotal)}
                    {currency}
                  </Text>
                </Text>
              </Text>
            </View>

            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={styles.title}>
                <Text style={{ textAlign: "left" }}>{t("ShippingCost")}</Text>
              </Text>
              <Text style={styles.title}>
                <Text style={{ textAlign: "left" }}>
                  <Text style={styles.infoCost}>
                    {getNumberTwo(data?.shippingCost)}
                    {currency}
                  </Text>
                </Text>
              </Text>
            </View>
            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={styles.title}>
                <Text style={{ textAlign: "left" }}>{t("discount")} </Text>
              </Text>
              <Text style={styles.title}>
                <Text style={{ textAlign: "left" }}>
                  <Text style={styles.infoCost}>
                    {getNumberTwo(data?.discount)}
                    {currency}
                  </Text>
                </Text>
              </Text>
            </View>
            <View style={{ width: "25%", alignItems: "baseline" }}>
              <Text style={styles.title}>
                <Text
                  style={{ width: "45%", textAlign: "right", float: "left" }}
                >
                  Total
                </Text>
              </Text>
              <Text style={styles.title}>
                <Text style={styles.totalAmount}>
                  {getNumberTwo(data?.total)}
                  {currency}
                </Text>
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </>
  );
};

export default InvoiceForDownload;