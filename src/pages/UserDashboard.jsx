import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { requestTransaction } from "../redux/txnSlice";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Grid,
  Fade,
  Grow,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  SwapHoriz as TransferIcon,
  Add as DepositIcon,
  Remove as WithdrawIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  ArrowDownward as DepositArrowIcon,
  ArrowUpward as WithdrawArrowIcon,
  CompareArrows as TransferArrowIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Public as InternationalIcon,
  LocalAtm as LocalIcon,
} from "@mui/icons-material";

// Yup validation schemas
const transferSchema = yup.object().shape({
  recipientId: yup.string().required("Recipient is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required")
    .test("balance-check", "Insufficient balance including commission", function (value) {
      if (!value) return true;
      const currentUserData = this.options.context?.currentUserData;
      const isInternational = this.parent.isInternational;
      const commission = isInternational ? value * 0.1 : value * 0.02;
      const totalAmount = value + commission;
      return currentUserData ? totalAmount <= currentUserData.balance : false;
    }),
  isInternational: yup.boolean(),
});

const depositSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required"),
});

const withdrawSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required")
    .test("balance-check", "Insufficient balance", function (value) {
      const currentUserData = this.options.context?.currentUserData;
      return currentUserData ? value <= currentUserData.balance : false;
    }),
});

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser, users } = useSelector((state) => state.user);
  const { transactions } = useSelector((state) => state.txn);

  const [activeTab, setActiveTab] = useState("overview");

  // Get current user data from users array (to get updated balance)
  const currentUserData = useMemo(() => {
    return users.find((u) => u.id === currentUser?.id) || currentUser;
  }, [users, currentUser]);

  // React Hook Form setup for each form
  const {
    register: registerTransfer,
    handleSubmit: handleTransferSubmit,
    watch: watchTransfer,
    formState: { errors: transferErrors },
    reset: resetTransfer,
  } = useForm({
    resolver: yupResolver(transferSchema),
    context: { currentUserData }, // Pass currentUserData for balance validation
    defaultValues: {
      recipientId: "",
      amount: "",
      isInternational: false,
    },
  });
  const {
    register: registerDeposit,
    handleSubmit: handleDepositSubmit,
    formState: { errors: depositErrors },
    reset: resetDeposit,
  } = useForm({
    resolver: yupResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  });

  const {
    register: registerWithdraw,
    handleSubmit: handleWithdrawSubmit,
    formState: { errors: withdrawErrors },
    reset: resetWithdraw,
  } = useForm({
    resolver: yupResolver(withdrawSchema),
    context: { currentUserData }, // Pass currentUserData for balance validation
    defaultValues: {
      amount: "",
    },
  });

  const watchTransferFields = watchTransfer();

  // Get user's transactions
  const userTransactions = useMemo(() => {
    return transactions.filter((txn) => txn.fromId === currentUserData?.id || txn.toId === currentUserData?.id);
  }, [transactions, currentUserData?.id]);

  const handleTransfer = (data) => {
    const amount = parseFloat(data.amount);
    const commission = data.isInternational ? amount * 0.1 : amount * 0.02;

    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: data.recipientId,
        amount,
        type: "transfer",
        isInternational: data.isInternational,
      })
    );

    resetTransfer();
    alert("Transfer request submitted for admin approval!");
  };
  const handleDeposit = (data) => {
    const amount = parseFloat(data.amount);

    dispatch(
      requestTransaction({
        fromId: "external",
        toId: currentUserData.id,
        amount,
        type: "deposit",
        isInternational: false,
      })
    );

    resetDeposit();
    alert("Deposit request submitted for admin approval!");
  };

  const handleWithdraw = (data) => {
    const amount = parseFloat(data.amount);

    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: "external",
        amount,
        type: "withdraw",
        isInternational: false,
      })
    );

    resetWithdraw();
    alert("Withdrawal request submitted for admin approval!");
  };

  const getRecipientName = (recipientId) => {
    if (recipientId === "external") return "External Account";
    const recipient = users.find((u) => u.id === recipientId);
    return recipient ? recipient.name : recipientId;
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Calculate stats
  const approvedTransactions = useMemo(() => {
    return userTransactions.filter((txn) => txn.status === "approved");
  }, [userTransactions]);

  const pendingTransactions = useMemo(() => {
    return userTransactions.filter((txn) => txn.status === "pending");
  }, [userTransactions]);

  const thisMonthTransactions = useMemo(() => {
    const now = new Date();
    return userTransactions.filter((txn) => {
      const txnDate = new Date(txn.timestamp);
      return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
    });
  }, [userTransactions]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Box sx={{ mt: 3 }}>
            {/* Balance Card */}
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Balance
                </Typography>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {formatCurrency(currentUserData?.balance || 0)}
                </Typography>
                <Typography variant="body2">Available for transfer</Typography>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {userTransactions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Pending Approval
                    </Typography>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {pendingTransactions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      This Month
                    </Typography>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {thisMonthTransactions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Transactions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {userTransactions.length > 0 ? (
                  <List>
                    {userTransactions.slice(0, 5).map((txn) => (
                      <Fade in key={txn.id}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  txn.type === "deposit"
                                    ? "success.main"
                                    : txn.type === "withdraw"
                                    ? "error.main"
                                    : "primary.main",
                              }}
                            >
                              {txn.type === "deposit" ? (
                                <DepositArrowIcon />
                              ) : txn.type === "withdraw" ? (
                                <WithdrawArrowIcon />
                              ) : (
                                <TransferArrowIcon />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              txn.type === "deposit"
                                ? "Deposit"
                                : txn.type === "withdraw"
                                ? "Withdrawal"
                                : txn.fromId === currentUserData.id
                                ? `To ${getRecipientName(txn.toId)}`
                                : `From ${getRecipientName(txn.fromId)}`
                            }
                            secondary={formatDate(txn.timestamp)}
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography
                                variant="body1"
                                color={
                                  txn.fromId === currentUserData.id && txn.type !== "deposit"
                                    ? "error.main"
                                    : "success.main"
                                }
                              >
                                {txn.fromId === currentUserData.id && txn.type !== "deposit" ? "-" : "+"}
                                {formatCurrency(txn.amount)}
                              </Typography>
                              <Chip
                                size="small"
                                label={txn.status}
                                color={txn.status === "pending" ? "warning" : "success"}
                                icon={txn.status === "pending" ? <PendingIcon /> : <ApprovedIcon />}
                              />
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Fade>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case "transfer":
        return (
          <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Send Money
                </Typography>
                <form onSubmit={handleTransferSubmit(handleTransfer)}>
                  <Stack spacing={3}>
                    <FormControl fullWidth error={!!transferErrors.recipientId}>
                      <InputLabel id="recipient-label">Recipient</InputLabel>
                      <Select labelId="recipient-label" label="Recipient" {...registerTransfer("recipientId")} required>
                        <MenuItem value="">Select recipient</MenuItem>
                        {users
                          .filter((u) => u.id !== currentUserData?.id && !u.isAdmin)
                          .map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name} ({user.id})
                            </MenuItem>
                          ))}
                      </Select>
                      {transferErrors.recipientId && (
                        <Typography variant="caption" color="error">
                          {transferErrors.recipientId.message}
                        </Typography>
                      )}
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      inputProps={{ step: "0.01", min: "0.01" }}
                      {...registerTransfer("amount")}
                      error={!!transferErrors.amount}
                      helperText={transferErrors.amount?.message}
                      required
                    />

                    <FormControlLabel
                      control={<Checkbox {...registerTransfer("isInternational")} />}
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography>International Transfer</Typography>
                          <InternationalIcon fontSize="small" />
                          <Chip label="10% commission" size="small" color="warning" />
                        </Stack>
                      }
                    />

                    {watchTransferFields.amount && (
                      <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.100" }}>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            Commission ({watchTransferFields.isInternational ? "10%" : "2%"}):{" "}
                            {formatCurrency(
                              parseFloat(watchTransferFields.amount || 0) *
                                (watchTransferFields.isInternational ? 0.1 : 0.02)
                            )}
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            Total:{" "}
                            {formatCurrency(
                              parseFloat(watchTransferFields.amount || 0) *
                                (1 + (watchTransferFields.isInternational ? 0.1 : 0.02))
                            )}
                          </Typography>
                          {transferErrors.amount?.type === "balance-check" && (
                            <Typography variant="body2" color="error">
                              {transferErrors.amount.message}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    )}

                    <Paper elevation={0} sx={{ p: 2, bgcolor: "primary.50" }}>
                      <Typography variant="body2" color="primary">
                        Available Balance: {formatCurrency(currentUserData?.balance || 0)}
                      </Typography>
                    </Paper>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<TransferIcon />}
                      sx={{
                        background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
                      }}
                    >
                      Send Money
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Box>
        );

      case "deposit":
        return (
          <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Add Funds
                </Typography>
                <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
                  Deposit requests require admin approval before funds are added to your account.
                </Alert>
                <form onSubmit={handleDepositSubmit(handleDeposit)}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      inputProps={{ step: "0.01", min: "0.01" }}
                      {...registerDeposit("amount")}
                      error={!!depositErrors.amount}
                      helperText={depositErrors.amount?.message}
                      required
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<DepositIcon />}
                      sx={{
                        background: "linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)",
                        boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                      }}
                    >
                      Request Deposit
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Box>
        );

      case "withdraw":
        return (
          <Box sx={{ mt: 3, maxWidth: 600, mx: "auto" }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Withdraw Funds
                </Typography>
                <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
                  Withdrawal requests require admin approval before funds are deducted from your account.
                </Alert>
                <form onSubmit={handleWithdrawSubmit(handleWithdraw)}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      inputProps={{
                        step: "0.01",
                        min: "0.01",
                      }}
                      {...registerWithdraw("amount")}
                      error={!!withdrawErrors.amount}
                      helperText={withdrawErrors.amount?.message}
                      required
                    />

                    <Typography variant="body2" color="text.secondary">
                      Available balance: {formatCurrency(currentUserData?.balance || 0)}
                    </Typography>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<WithdrawIcon />}
                      sx={{
                        background: "linear-gradient(45deg, #f44336 30%, #c62828 90%)",
                        boxShadow: "0 3px 5px 2px rgba(244, 67, 54, .3)",
                      }}
                    >
                      Request Withdrawal
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Box>
        );

      case "history":
        return (
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Transaction History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {userTransactions.length > 0 ? (
                  <List>
                    {userTransactions.map((txn) => (
                      <Fade in key={txn.id}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  txn.type === "deposit"
                                    ? "success.main"
                                    : txn.type === "withdraw"
                                    ? "error.main"
                                    : "primary.main",
                              }}
                            >
                              {txn.type === "deposit" ? (
                                <DepositArrowIcon />
                              ) : txn.type === "withdraw" ? (
                                <WithdrawArrowIcon />
                              ) : (
                                <TransferArrowIcon />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              txn.type === "deposit"
                                ? "Deposit"
                                : txn.type === "withdraw"
                                ? "Withdrawal"
                                : txn.fromId === currentUserData.id
                                ? `Transfer to ${getRecipientName(txn.toId)}`
                                : `Transfer from ${getRecipientName(txn.fromId)}`
                            }
                            secondary={
                              <>
                                {formatDate(txn.timestamp)} •{" "}
                                {txn.isInternational ? (
                                  <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                                    <InternationalIcon fontSize="small" />
                                    <span>International</span>
                                  </Stack>
                                ) : (
                                  <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                                    <LocalIcon fontSize="small" />
                                    <span>Domestic</span>
                                  </Stack>
                                )}
                                {txn.commission > 0 && (
                                  <Box component="span" display="block" fontSize="0.75rem">
                                    Commission: {formatCurrency(txn.commission)}
                                  </Box>
                                )}
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="column" alignItems="flex-end" spacing={1}>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                color={
                                  txn.fromId === currentUserData.id && txn.type !== "deposit"
                                    ? "error.main"
                                    : "success.main"
                                }
                              >
                                {txn.fromId === currentUserData.id && txn.type !== "deposit" ? "-" : "+"}
                                {formatCurrency(txn.amount)}
                              </Typography>
                              <Chip
                                size="small"
                                label={txn.status}
                                color={txn.status === "pending" ? "warning" : "success"}
                                icon={txn.status === "pending" ? <PendingIcon /> : <ApprovedIcon />}
                              />
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Fade>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      {/* App Bar */}
      <Paper
        elevation={1}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderRadius: 0,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  width: 40,
                  height: 40,
                }}
              >
                MT
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                MoneyTransfer
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="column" alignItems="flex-end">
                <Typography variant="body2" fontWeight="medium">
                  Welcome, {currentUserData?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Balance: {formatCurrency(currentUserData?.balance || 0)}
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  dispatch(logout());
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              },
            }}
          >
            <Tab value="overview" label="Overview" icon={<BalanceIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab
              value="transfer"
              label="Transfer"
              icon={<TransferIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab value="deposit" label="Deposit" icon={<DepositIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab
              value="withdraw"
              label="Withdraw"
              icon={<WithdrawIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab value="history" label="History" icon={<HistoryIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </Box>
  );
};

export default UserDashboard;
